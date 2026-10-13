let employees=JSON.parse(localStorage.getItem("employees"))||[];
let tasks=JSON.parse(localStorage.getItem("tasks"))||[];
let attendance=JSON.parse(localStorage.getItem("attendance"))||[];
let activities=JSON.parse(localStorage.getItem("activities"))||[];
let loggedEmployee=null;

function saveData(){
    localStorage.setItem("employees",JSON.stringify(employees));
    localStorage.setItem("tasks",JSON.stringify(tasks));
    localStorage.setItem("attendance",JSON.stringify(attendance));
    localStorage.setItem("activities",JSON.stringify(activities));
}
function getToday(){
    let date=new Date();
    let year=date.getFullYear();
    let month=String(date.getMonth()+1).padStart(2,"0");
    let day=String(date.getDate()).padStart(2,"0");
    return year+"-"+month+"-"+day;
}
function getCurrentTime(){
    return new Date().toLocaleTimeString();
}
function addActivity(message){
    activities.unshift({
        message:message,
        time:getCurrentTime()
    });
    activities=activities.slice(0,30);
    saveData();
    displayActivities();
}
function showAdminLogin(){
    $("#adminLoginBox").removeClass("hidden").show();
    $("#employeeLoginBox").addClass("hidden").hide();
    $("#adminTab").addClass("active");
    $("#employeeTab").removeClass("active");
}
function showEmployeeLogin(){
    $("#adminLoginBox").addClass("hidden").hide();
    $("#employeeLoginBox").removeClass("hidden").show();
    $("#employeeTab").addClass("active");
    $("#adminTab").removeClass("active");
}
function adminLogin(){
    let username=$("#adminUsername").val().trim();
    let password=$("#adminPassword").val().trim();
    if(username==="admin"&&password==="1234"){
        $("#loginPage").hide();
        $("#adminDashboard").removeClass("hidden").show();
        updateDashboard();
        loadEmployeeDropdown();
        displayEmployees();
        displayTasks();
        displayAttendance();
        displayActivities();
    }else{
        alert("Invalid Admin Login");
    }
}
function employeeLogin(){
    let id=$("#employeeLoginId").val().trim();
    let password=$("#employeeLoginPassword").val().trim();

    let employee=employees.find(function(item){
        return item.id===id&&item.password===password;
    });
    if(employee){
        loggedEmployee=employee;
        $("#loginPage").hide();
        $("#employeeDashboard").removeClass("hidden").show();
        showEmployeeProfile(employee);
        displayEmployeeTasks(employee.id);
        displayEmployeeNotifications(employee.id);
        displayEmployeeAttendance(employee.id);
    }else{
        alert("Invalid Employee ID or Password");
    }
}
function addEmployee(){
    let id=$("#employeeId").val().trim();
    let name=$("#employeeName").val().trim();
    let password=$("#employeePassword").val().trim();
    let email=$("#employeeEmail").val().trim();
    let phone=$("#employeePhone").val().trim();
    let department=$("#employeeDepartment").val().trim();
    let designation=$("#employeeDesignation").val().trim();
    let joiningDate=$("#joiningDate").val();
    let status=$("#employeeStatus").val();
    if(id===""||name===""||password===""||email===""||phone===""||department===""||designation===""||joiningDate===""){
        alert("Please fill all fields");
        return;
    }
    let exists=employees.some(function(employee){
        return employee.id===id;
    });
    if(exists){
        alert("Employee ID already exists");
        return;
    }

    employees.push({
        id:id,
        name:name,
        password:password,
        email:email,
        phone:phone,
        department:department,
        designation:designation,
        joiningDate:joiningDate,
        status:status
    });

    saveData();
    addActivity(name+" was added as employee");

    clearEmployeeForm();
    loadEmployeeDropdown();
    displayEmployees();
    updateDashboard();

    alert("Employee added successfully");
}

function clearEmployeeForm(){
    $("#employeeId").val("");
    $("#employeeName").val("");
    $("#employeePassword").val("");
    $("#employeeEmail").val("");
    $("#employeePhone").val("");
    $("#employeeDepartment").val("");
    $("#employeeDesignation").val("");
    $("#joiningDate").val("");
    $("#employeeStatus").val("Active");
}

function loadEmployeeDropdown(){
    $("#taskEmployee").html('<option value="">Select Employee</option>');
    $("#attendanceEmployee").html('<option value="">Select Employee</option>');
    $("#attendanceFilterEmployee").html('<option value="">All Employees</option>');

    employees.forEach(function(employee){
        if(employee.status==="Active"){
            $("#taskEmployee").append('<option value="'+employee.id+'">'+employee.name+'</option>');
            $("#attendanceEmployee").append('<option value="'+employee.id+'">'+employee.name+'</option>');
        }

        $("#attendanceFilterEmployee").append('<option value="'+employee.id+'">'+employee.name+'</option>');
    });
}

function assignTask(){
    let id=$("#taskId").val().trim();
    let title=$("#taskTitle").val().trim();
    let description=$("#taskDescription").val().trim();
    let dueDate=$("#taskDueDate").val();
    let employeeId=$("#taskEmployee").val();
    let priority=$("#taskPriority").val();

    if(id===""||title===""||description===""||dueDate===""||employeeId===""){
        alert("Please fill all task fields");
        return;
    }

    let exists=tasks.some(function(task){
        return task.id===id;
    });

    if(exists){
        alert("Task ID already exists");
        return;
    }

    let employee=employees.find(function(item){
        return item.id===employeeId;
    });

    if(!employee){
        alert("Employee not found");
        return;
    }

    tasks.push({
        id:id,
        title:title,
        description:description,
        dueDate:dueDate,
        employeeId:employee.id,
        employeeName:employee.name,
        priority:priority,
        status:"Pending",
        progress:0
    });

    saveData();
    addActivity("Task "+title+" assigned to "+employee.name);

    clearTaskForm();
    displayTasks();
    updateDashboard();

    alert("Task assigned successfully");
}

function clearTaskForm(){
    $("#taskId").val("");
    $("#taskTitle").val("");
    $("#taskDescription").val("");
    $("#taskDueDate").val("");
    $("#taskEmployee").val("");
    $("#taskPriority").val("Medium");
}

function getActualStatus(task){
    if(task.status!=="Completed"&&new Date(task.dueDate+"T23:59:59")<new Date()){
        return "Overdue";
    }

    return task.status;
}

function getTaskStatusClass(status){
    return status.replace(" ","-").toLowerCase();
}

function displayEmployees(){
    let search=$("#searchEmployee").val().toLowerCase();
    let department=$("#filterDepartment").val();

    let departments=[...new Set(employees.map(function(employee){
        return employee.department;
    }))];

    $("#filterDepartment").html('<option value="">All Departments</option>');

    departments.forEach(function(item){
        $("#filterDepartment").append('<option value="'+item+'">'+item+'</option>');
    });

    $("#filterDepartment").val(department);

    let result=employees.filter(function(employee){
        let searchMatch=employee.name.toLowerCase().includes(search)||employee.id.toLowerCase().includes(search);
        let departmentMatch=department===""||employee.department===department;

        return searchMatch&&departmentMatch;
    });

    $("#employeeTable").html("");

    if(result.length===0){
        $("#employeeTable").html('<tr><td colspan="6">No employees found</td></tr>');
        return;
    }

    result.forEach(function(employee){
        let index=employees.indexOf(employee);

        $("#employeeTable").append(`
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.designation}</td>
                <td>
                    <span class="status-badge ${employee.status.toLowerCase()}">
                        ${employee.status}
                    </span>
                </td>
                <td>
                    <button onclick="viewEmployee(${index})">View</button>
                    <button onclick="editEmployee(${index})">Edit</button>
                    <button onclick="deleteEmployee(${index})">Delete</button>
                </td>
            </tr>
        `);
    });
}

function displayTasks(){
    let statusFilter=$("#taskStatusFilter").val();
    let priorityFilter=$("#taskPriorityFilter").val();

    let result=tasks.filter(function(task){
        let status=getActualStatus(task);
        let statusMatch=statusFilter===""||status===statusFilter;
        let priorityMatch=priorityFilter===""||task.priority===priorityFilter;

        return statusMatch&&priorityMatch;
    });

    $("#taskTable").html("");

    if(result.length===0){
        $("#taskTable").html('<tr><td colspan="8">No tasks found</td></tr>');
        return;
    }

    result.forEach(function(task){
        let index=tasks.indexOf(task);
        let status=getActualStatus(task);

        $("#taskTable").append(`
            <tr>
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.employeeName}</td>
                <td>${task.priority}</td>
                <td>${task.dueDate}</td>
                <td>
                    <span class="status-badge ${getTaskStatusClass(status)}">
                        ${status}
                    </span>
                </td>
                <td>
                    <div class="progress">
                        <div class="progress-bar" style="width:${task.progress}%"></div>
                    </div>
                    ${task.progress}%
                </td>
                <td>
                    <button onclick="viewTask(${index})">View</button>
                    <button onclick="deleteTask(${index})">Delete</button>
                </td>
            </tr>
        `);
    });
}

function displayEmployeeTasks(employeeId){
    let myTasks=tasks.filter(function(task){
        return task.employeeId===employeeId;
    });

    let pending=myTasks.filter(function(task){
        return task.status==="Pending";
    }).length;

    let progress=myTasks.filter(function(task){
        return task.status==="In Progress";
    }).length;

    let completed=myTasks.filter(function(task){
        return task.status==="Completed";
    }).length;

    $("#myTotalTasks").text(myTasks.length);
    $("#myPendingTasks").text(pending);
    $("#myProgressTasks").text(progress);
    $("#myCompletedTasks").text(completed);

    $("#employeeTasks").html("");

    if(myTasks.length===0){
        $("#employeeTasks").html("<p>No tasks assigned yet.</p>");
        return;
    }

    myTasks.forEach(function(task){
        let status=getActualStatus(task);

        $("#employeeTasks").append(`
            <div class="task-card">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p><strong>Due Date:</strong> ${task.dueDate}</p>
                <p><strong>Priority:</strong> ${task.priority}</p>
                <p><strong>Progress:</strong> ${task.progress}%</p>

                <select onchange="changeTaskStatus('${task.id}',this.value)">
                    <option value="Pending" ${task.status==="Pending"?"selected":""}>Pending</option>
                    <option value="In Progress" ${task.status==="In Progress"?"selected":""}>In Progress</option>
                    <option value="Completed" ${task.status==="Completed"?"selected":""}>Completed</option>
                </select>

                <span class="status-badge ${getTaskStatusClass(status)}">
                    ${status}
                </span>

                <div class="progress">
                    <div class="progress-bar" style="width:${task.progress}%"></div>
                </div>
            </div>
        `);
    });
}

function changeTaskStatus(taskId,newStatus){
    let task=tasks.find(function(item){
        return item.id===taskId;
    });

    if(!task){
        return;
    }

    task.status=newStatus;

    if(newStatus==="Pending"){
        task.progress=0;
    }

    if(newStatus==="In Progress"){
        task.progress=50;
    }

    if(newStatus==="Completed"){
        task.progress=100;
    }

    saveData();

    if(loggedEmployee){
        addActivity(loggedEmployee.name+" changed "+task.title+" to "+newStatus);
        displayEmployeeTasks(loggedEmployee.id);
        displayEmployeeNotifications(loggedEmployee.id);
    }

    displayTasks();
    updateDashboard();

    alert("Task status updated");
}

function displayEmployeeNotifications(employeeId){
    let myTasks=tasks.filter(function(task){
        return task.employeeId===employeeId;
    });

    $("#employeeNotifications").html("");

    if(myTasks.length===0){
        $("#employeeNotifications").html("<div class='notification'>No notifications</div>");
        return;
    }

    myTasks.forEach(function(task){
        let status=getActualStatus(task);
        let message="Task "+task.title+" is assigned to you";

        if(status==="Completed"){
            message="Task "+task.title+" completed successfully";
        }

        if(status==="Overdue"){
            message="Task "+task.title+" is overdue";
        }

        $("#employeeNotifications").append(`
            <div class="notification">
                <i class="fa-solid fa-bell"></i>
                ${message}
            </div>
        `);
    });
}

function updateDashboard(){
    $("#totalEmployees").text(employees.length);

    $("#activeEmployees").text(
        employees.filter(function(employee){
            return employee.status==="Active";
        }).length
    );

    $("#totalTasks").text(tasks.length);

    $("#completedTasks").text(
        tasks.filter(function(task){
            return task.status==="Completed";
        }).length
    );

    $("#pendingTasks").text(
        tasks.filter(function(task){
            return task.status!=="Completed";
        }).length
    );

    updateAttendanceSummary();
}

function displayActivities(){
    $("#activityList").html("");

    if(activities.length===0){
        $("#activityList").html("<p>No recent activity.</p>");
        return;
    }

    activities.slice(0,10).forEach(function(activity){
        $("#activityList").append(`
            <div class="activity">
                <p>${activity.message}</p>
                <small>${activity.time}</small>
            </div>
        `);
    });
}

function showEmployeeProfile(employee){
    $("#employeeWelcome").text("Welcome, "+employee.name);

    $("#employeeProfile").html(`
        <p><strong>ID:</strong> ${employee.id}</p>
        <p><strong>Name:</strong> ${employee.name}</p>
        <p><strong>Email:</strong> ${employee.email}</p>
        <p><strong>Phone:</strong> ${employee.phone}</p>
        <p><strong>Department:</strong> ${employee.department}</p>
        <p><strong>Designation:</strong> ${employee.designation}</p>
        <p><strong>Joining Date:</strong> ${employee.joiningDate}</p>
        <p><strong>Status:</strong> ${employee.status}</p>
    `);
}

function viewEmployee(index){
    let employee=employees[index];

    $("#viewModalBody").html(`
        <p><strong>ID:</strong> ${employee.id}</p>
        <p><strong>Name:</strong> ${employee.name}</p>
        <p><strong>Email:</strong> ${employee.email}</p>
        <p><strong>Phone:</strong> ${employee.phone}</p>
        <p><strong>Department:</strong> ${employee.department}</p>
        <p><strong>Designation:</strong> ${employee.designation}</p>
        <p><strong>Joining Date:</strong> ${employee.joiningDate}</p>
        <p><strong>Status:</strong> ${employee.status}</p>
    `);

    $("#viewModal").removeClass("hidden").show();
}

function editEmployee(index){
    let employee=employees[index];

    $("#editIndex").val(index);
    $("#editEmployeeId").val(employee.id);
    $("#editEmployeeName").val(employee.name);
    $("#editEmployeePassword").val(employee.password);
    $("#editEmployeeEmail").val(employee.email);
    $("#editEmployeePhone").val(employee.phone);
    $("#editEmployeeDepartment").val(employee.department);
    $("#editEmployeeDesignation").val(employee.designation);
    $("#editJoiningDate").val(employee.joiningDate);
    $("#editEmployeeStatus").val(employee.status);

    $("#editModal").removeClass("hidden").show();
}

function updateEmployee(){
    let index=Number($("#editIndex").val());

    let employee=employees[index];

    if(!employee){
        return;
    }

    let oldId=employee.id;
    let id=$("#editEmployeeId").val().trim();
    let name=$("#editEmployeeName").val().trim();
    let password=$("#editEmployeePassword").val().trim();
    let email=$("#editEmployeeEmail").val().trim();
    let phone=$("#editEmployeePhone").val().trim();
    let department=$("#editEmployeeDepartment").val().trim();
    let designation=$("#editEmployeeDesignation").val().trim();
    let joiningDate=$("#editJoiningDate").val();
    let status=$("#editEmployeeStatus").val();

    if(id===""||name===""||password===""||email===""||phone===""||department===""||designation===""||joiningDate===""){
        alert("Please fill all fields");
        return;
    }

    let exists=employees.some(function(item,i){
        return item.id===id&&i!==index;
    });

    if(exists){
        alert("Employee ID already exists");
        return;
    }

    employees[index]={
        id:id,
        name:name,
        password:password,
        email:email,
        phone:phone,
        department:department,
        designation:designation,
        joiningDate:joiningDate,
        status:status
    };

    tasks.forEach(function(task){
        if(task.employeeId===oldId){
            task.employeeId=id;
            task.employeeName=name;
        }
    });

    attendance.forEach(function(item){
        if(item.employeeId===oldId){
            item.employeeId=id;
            item.employeeName=name;
        }
    });

    saveData();
    addActivity(name+" employee details updated");

    closeEditModal();
    loadEmployeeDropdown();
    displayEmployees();
    displayTasks();
    displayAttendance();
    updateDashboard();

    alert("Employee updated successfully");
}

function deleteEmployee(index){
    let employee=employees[index];

    if(!employee){
        return;
    }

    if(!confirm("Delete this employee?")){
        return;
    }

    tasks=tasks.filter(function(task){
        return task.employeeId!==employee.id;
    });

    attendance=attendance.filter(function(item){
        return item.employeeId!==employee.id;
    });

    employees.splice(index,1);

    saveData();
    addActivity(employee.name+" employee deleted");

    loadEmployeeDropdown();
    displayEmployees();
    displayTasks();
    displayAttendance();
    updateDashboard();

    alert("Employee deleted");
}

function viewTask(index){
    let task=tasks[index];

    if(!task){
        return;
    }

    $("#taskModalBody").html(`
        <p><strong>Task ID:</strong> ${task.id}</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Employee:</strong> ${task.employeeName}</p>
        <p><strong>Due Date:</strong> ${task.dueDate}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Status:</strong> ${getActualStatus(task)}</p>
        <p><strong>Progress:</strong> ${task.progress}%</p>
    `);

    $("#taskModal").removeClass("hidden").show();
}

function deleteTask(index){
    let task=tasks[index];

    if(!task){
        return;
    }

    if(!confirm("Delete this task?")){
        return;
    }

    tasks.splice(index,1);

    saveData();
    addActivity("Task "+task.title+" deleted");

    displayTasks();
    updateDashboard();

    alert("Task deleted");
}

function closeModal(){
    $("#viewModal").addClass("hidden").hide();
}

function closeEditModal(){
    $("#editModal").addClass("hidden").hide();
}

function closeTaskModal(){
    $("#taskModal").addClass("hidden").hide();
}

function logout(){
    loggedEmployee=null;

    $("#adminDashboard").addClass("hidden").hide();
    $("#employeeDashboard").addClass("hidden").hide();
    $("#loginPage").show();

    $("#adminUsername").val("");
    $("#adminPassword").val("");
    $("#employeeLoginId").val("");
    $("#employeeLoginPassword").val("");

    showAdminLogin();
}

function markAttendance(){
    if(!loggedEmployee){
        return;
    }

    let today=getToday();

    let exists=attendance.some(function(item){
        return item.employeeId===loggedEmployee.id&&item.date===today;
    });

    if(exists){
        alert("Attendance already marked for today");
        return;
    }

    attendance.push({
        employeeId:loggedEmployee.id,
        employeeName:loggedEmployee.name,
        date:today,
        time:getCurrentTime(),
        status:"Present"
    });

    saveData();
    addActivity(loggedEmployee.name+" marked attendance as Present");

    displayEmployeeAttendance(loggedEmployee.id);
    displayAttendance();
    updateDashboard();

    alert("Today's attendance marked as Present");
}

function markAdminAttendance(){
    let date=$("#attendanceDate").val();
    let employeeId=$("#attendanceEmployee").val();
    let status=$("#attendanceStatus").val();

    if(date===""||employeeId===""||status===""){
        alert("Please select all attendance details");
        return;
    }

    let employee=employees.find(function(item){
        return item.id===employeeId;
    });

    if(!employee){
        alert("Employee not found");
        return;
    }

    let existing=attendance.find(function(item){
        return item.employeeId===employeeId&&item.date===date;
    });

    if(existing){
        existing.status=status;
        existing.time=getCurrentTime();
    }else{
        attendance.push({
            employeeId:employee.id,
            employeeName:employee.name,
            date:date,
            time:getCurrentTime(),
            status:status
        });
    }

    saveData();
    addActivity("Admin marked "+employee.name+" as "+status);

    displayAttendance();
    updateDashboard();

    if(loggedEmployee){
        displayEmployeeAttendance(loggedEmployee.id);
    }

    alert("Attendance saved");
}

function displayAttendance(){
    let date=$("#attendanceFilterDate").val();
    let employeeId=$("#attendanceFilterEmployee").val();
    let status=$("#attendanceFilterStatus").val();

    let result=attendance.filter(function(item){
        let dateMatch=date===""||item.date===date;
        let employeeMatch=employeeId===""||item.employeeId===employeeId;
        let statusMatch=status===""||item.status===status;

        return dateMatch&&employeeMatch&&statusMatch;
    });

    result.sort(function(a,b){
        return new Date(b.date)-new Date(a.date);
    });

    $("#attendanceTable").html("");

    if(result.length===0){
        $("#attendanceTable").html('<tr><td colspan="6">No attendance records found</td></tr>');
        return;
    }

    result.forEach(function(item){
        let index=attendance.indexOf(item);

        $("#attendanceTable").append(`
            <tr>
                <td>${item.date}</td>
                <td>${item.time||"-"}</td>
                <td>${item.employeeId}</td>
                <td>${item.employeeName}</td>
                <td>
                    <span class="attendance-status ${item.status.toLowerCase()}">
                        ${item.status}
                    </span>
                </td>
                <td>
                    <button onclick="deleteAttendance(${index})">Delete</button>
                </td>
            </tr>
        `);
    });
}

function deleteAttendance(index){
    if(!confirm("Delete this attendance?")){
        return;
    }

    attendance.splice(index,1);

    saveData();
    displayAttendance();
    updateDashboard();

    if(loggedEmployee){
        displayEmployeeAttendance(loggedEmployee.id);
    }

    alert("Attendance deleted");
}

function updateAttendanceSummary(){
    let today=getToday();

    let todayRecords=attendance.filter(function(item){
        return item.date===today;
    });

    $("#todayPresent").text(
        todayRecords.filter(function(item){
            return item.status==="Present";
        }).length
    );

    $("#todayAbsent").text(
        todayRecords.filter(function(item){
            return item.status==="Absent";
        }).length
    );

    $("#todayLeave").text(
        todayRecords.filter(function(item){
            return item.status==="Leave";
        }).length
    );
}

function displayEmployeeAttendance(employeeId){
    let records=attendance.filter(function(item){
        return item.employeeId===employeeId;
    });

    let present=records.filter(function(item){
        return item.status==="Present";
    }).length;

    let absent=records.filter(function(item){
        return item.status==="Absent";
    }).length;

    let leave=records.filter(function(item){
        return item.status==="Leave";
    }).length;

    let percentage=records.length===0?0:Math.round((present/records.length)*100);

    let today=getToday();

    let todayRecord=records.find(function(item){
        return item.date===today;
    });

    if(todayRecord){
        $("#myTodayAttendance").text(todayRecord.status+" - "+(todayRecord.time||""));
        $("#attendance-btn").prop("disabled",true);
    }else{
        $("#myTodayAttendance").text("Not Marked");
        $("#attendance-btn").prop("disabled",false);
    }

    $("#myPresentCount").text(present);
    $("#myAbsentCount").text(absent);
    $("#myLeaveCount").text(leave);
    $("#myAttendancePercentage").text(percentage+"%");

    $("#employeeAttendanceTable").html("");

    if(records.length===0){
        $("#employeeAttendanceTable").html('<tr><td colspan="3">No attendance records</td></tr>');
        return;
    }

    records.sort(function(a,b){
        return new Date(b.date)-new Date(a.date);
    });

    records.forEach(function(item){
        $("#employeeAttendanceTable").append(`
            <tr>
                <td>${item.date}</td>
                <td>${item.time||"-"}</td>
                <td>${item.status}</td>
            </tr>
        `);
    });
}

$(document).ready(function(){

    $("#attendanceDate").val(getToday());
    $("#attendanceFilterDate").val(getToday());

    loadEmployeeDropdown();
    displayEmployees();
    displayTasks();
    displayAttendance();
    displayActivities();
    updateDashboard();

    $("#cursorBall").hide();

    $(document).on("mousemove",function(event){
        $("#cursorBall").show();

        $("#cursorBall").css({
            left:event.clientX+"px",
            top:event.clientY+"px"
        });
    });
    console.log("Work Pro Loaded Successfully")
});
