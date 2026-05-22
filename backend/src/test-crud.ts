const BASE_URL = 'http://localhost:5000/api';

async function runCrudTests() {
  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@ethara.ai`;
  const memberEmail = `member_${timestamp}@ethara.ai`;
  const password = 'password123';

  console.log('🚀 Starting Phase 2 CRUD & RBAC Integration Verification...\n');

  try {
    // ----------------------------------------------------
    // 1. SETUP: SIGNUP & LOGIN ADMIN AND MEMBER
    // ----------------------------------------------------
    console.log('--- 1. Registering & Authenticating Users ---');

    // Register Admin
    const signupAdminRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        name: 'Workspace Admin',
        password,
        role: 'ADMIN',
      }),
    });
    const adminSignupData = await signupAdminRes.json() as any;
    if (signupAdminRes.status !== 201) {
      throw new Error(`Admin signup failed: ${JSON.stringify(adminSignupData)}`);
    }
    console.log('✅ Admin Registered successfully');

    // Login Admin
    const loginAdminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminLoginData = await loginAdminRes.json() as any;
    const adminToken = adminLoginData.data.token;
    console.log('✅ Admin Logged In successfully');

    // Register Member
    const signupMemberRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memberEmail,
        name: 'Regular Member',
        password,
        role: 'MEMBER',
      }),
    });
    const memberSignupData = await signupMemberRes.json() as any;
    if (signupMemberRes.status !== 201) {
      throw new Error(`Member signup failed: ${JSON.stringify(memberSignupData)}`);
    }
    const memberId = memberSignupData.data.user.id;
    console.log(`✅ Member Registered successfully (ID: ${memberId})`);

    // Login Member
    const loginMemberRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: memberEmail, password }),
    });
    const memberLoginData = await loginMemberRes.json() as any;
    const memberToken = memberLoginData.data.token;
    console.log('✅ Member Logged In successfully');

    // ----------------------------------------------------
    // 2. PROJECT OPERATIONS
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Project CRUD and RBAC ---');

    // Admin creates a project
    const createProjectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Acme Project ${timestamp}`,
        description: 'Building the next big thing with Ethara AI Backend',
      }),
    });
    const createProjectData = await createProjectRes.json() as any;
    if (createProjectRes.status !== 201) {
      throw new Error(`Admin failed to create project: ${JSON.stringify(createProjectData)}`);
    }
    const projectId = createProjectData.data.project.id;
    console.log(`✅ Admin successfully created Project (ID: ${projectId})`);

    // Member attempts to create a project (Should be rejected - RBAC Check)
    const memberCreateProjectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        name: `Hacker Project ${timestamp}`,
      }),
    });
    const memberCreateProjectData = await memberCreateProjectRes.json() as any;
    if (memberCreateProjectRes.status === 403) {
      console.log('✅ RBAC Guard: Member Project creation successfully rejected (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 Forbidden for member project creation, but got ${memberCreateProjectRes.status}: ${JSON.stringify(memberCreateProjectData)}`);
    }

    // Admin updates the project
    const updateProjectRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Updated Acme Project ${timestamp}`,
        description: 'An updated epic description',
      }),
    });
    const updateProjectData = await updateProjectRes.json() as any;
    if (updateProjectRes.status !== 200) {
      throw new Error(`Admin failed to update project: ${JSON.stringify(updateProjectData)}`);
    }
    console.log('✅ Admin successfully updated Project properties');

    // Member attempts to update the project (Should fail - RBAC Check)
    const memberUpdateProjectRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        name: 'Hacked Project Title',
      }),
    });
    if (memberUpdateProjectRes.status === 403) {
      console.log('✅ RBAC Guard: Member Project update successfully rejected (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 Forbidden for member project update, but got ${memberUpdateProjectRes.status}`);
    }

    // ----------------------------------------------------
    // 3. TASK OPERATIONS & ASSIGNMENT
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Task CRUD & Relational Assignment ---');

    // Admin creates a task inside the project, assigned to the Member
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Complete Phase 2 Backend Architecture',
        description: 'Verify clean routing patterns, controllers, services, and tests.',
        priority: 'HIGH',
        dueDate: tomorrow.toISOString(),
        projectId,
        assigneeId: memberId,
      }),
    });
    const createTaskData = await createTaskRes.json() as any;
    if (createTaskRes.status !== 201) {
      throw new Error(`Admin failed to create task: ${JSON.stringify(createTaskData)}`);
    }
    const taskId = createTaskData.data.task.id;
    console.log(`✅ Admin successfully created and assigned Task (ID: ${taskId}, Assignee: ${memberId})`);

    // Verify task assignment relation exists in the response
    if (createTaskData.data.task.assigneeId === memberId && createTaskData.data.task.assignee?.name === 'Regular Member') {
      console.log('✅ Verified relational assignment to member works seamlessly.');
    } else {
      throw new Error(`Task assignee details missing or mismatch: ${JSON.stringify(createTaskData)}`);
    }

    // Member attempts to create a task (Should fail - RBAC Check)
    const memberCreateTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        title: 'Member Rogue Task',
        projectId,
      }),
    });
    if (memberCreateTaskRes.status === 403) {
      console.log('✅ RBAC Guard: Member Task creation successfully rejected (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 Forbidden for member task creation, but got ${memberCreateTaskRes.status}`);
    }

    // ----------------------------------------------------
    // 4. TASK STATUS PROGRESSION
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Task Status Progression (Allowed for Member) ---');

    // Member updates status to IN_PROGRESS
    const memberUpdateStatusRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });
    const memberUpdateStatusData = await memberUpdateStatusRes.json() as any;
    if (memberUpdateStatusRes.status !== 200) {
      throw new Error(`Member failed to update task status: ${JSON.stringify(memberUpdateStatusData)}`);
    }
    console.log(`✅ Member successfully updated task status to IN_PROGRESS`);

    // Member tries to update core task fields (Should fail - RBAC Check)
    const memberUpdateCoreTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        title: 'I want to change the title!',
      }),
    });
    if (memberUpdateCoreTaskRes.status === 403) {
      console.log('✅ RBAC Guard: Member core task update successfully rejected (403 Forbidden).');
    } else {
      throw new Error(`Expected 403 Forbidden for member core task update, but got ${memberUpdateCoreTaskRes.status}`);
    }

    // ----------------------------------------------------
    // 5. OVERDUE TASK CALCULATIONS
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Overdue Task Calculation Helper & API ---');

    // Let's create an overdue task: due date in the past, status is TODO or IN_PROGRESS
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const createOverdueTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'An Overdue Legacy Task',
        description: 'This was due yesterday!',
        priority: 'MEDIUM',
        dueDate: yesterday.toISOString(),
        projectId,
      }),
    });
    const createOverdueTaskData = await createOverdueTaskRes.json() as any;
    if (createOverdueTaskRes.status !== 201) {
      throw new Error(`Admin failed to create overdue task: ${JSON.stringify(createOverdueTaskData)}`);
    }
    const overdueTaskId = createOverdueTaskData.data.task.id;
    console.log(`✅ Admin created overdue task (ID: ${overdueTaskId}, Due Date: ${yesterday.toISOString()})`);

    // Fetch overdue tasks list
    const getOverdueRes = await fetch(`${BASE_URL}/tasks/overdue`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`, // Workspace members can view overdue tasks
      },
    });
    const getOverdueData = await getOverdueRes.json() as any;
    if (getOverdueRes.status !== 200) {
      throw new Error(`Failed to fetch overdue tasks: ${JSON.stringify(getOverdueData)}`);
    }

    const overdueList = getOverdueData.data.tasks;
    const foundOverdue = overdueList.some((task: any) => task.id === overdueTaskId);
    if (foundOverdue) {
      console.log('✅ Overdue Engine Success: The overdue task was correctly categorized and retrieved!');
    } else {
      throw new Error(`Expected overdue task ${overdueTaskId} to be in the overdue list, but it wasn't. List: ${JSON.stringify(overdueList)}`);
    }

    // ----------------------------------------------------
    // 6. TEARDOWN & CLEANUP
    // ----------------------------------------------------
    console.log('\n--- 6. Running Clean Teardown Operations ---');

    // Admin deletes the tasks
    const deleteTask1Res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (deleteTask1Res.status === 200) console.log('✅ Task 1 deleted successfully');

    const deleteTask2Res = await fetch(`${BASE_URL}/tasks/${overdueTaskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (deleteTask2Res.status === 200) console.log('✅ Task 2 deleted successfully');

    // Admin deletes project
    const deleteProjectRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (deleteProjectRes.status === 200) console.log('✅ Project deleted successfully');

    console.log('\n🎉 ALL CRUD, ASSIGNMENT, RBAC, AND OVERDUE TESTS PASSED MAGNIFICENTLY! 🎉');
  } catch (error: any) {
    console.error('\n❌ Integration Test failed:', error.message);
    process.exit(1);
  }
}

runCrudTests();

export {};
