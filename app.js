let editIndex = -1;

class Student {
    //private class field. can be used within the class
    #id;
    #name;
    #marks;

// curly brackets for object destructuring - sent as object- for not messing up arguments-
    constructor( { name,marks, id = null } ){
        this.name = name;
        this.marks = marks;
        // Math.random() generates a random decimal btwn 0 to 1
        // * 10000 multiplies 
        // Math.floor() rounds decimal to whole Number
        // #id is assigned a random between 0 to 9999
        this.#id = id !== null ?  id : Math.floor(Math.random() * 10000);
    }
    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get marks() {
        return this.#marks;
    }

    set name(value) {
        // console.log(value);
        if (!value  || value.trim() === ""){
            throw new Error("ayio Name")
        }
        this.#name = value;
    }
    set marks(value) {
        if (value < 0 || value >100 ){
            throw new Error("Marks must be between 0 and 100");
        } 
        this.#marks = value;

    }

    getDetails(){
        return `${this.name} - ${this.marks} marks`;
    }

    isPassed() {
        return this.marks >= 40;
    }

    getResultLabel(){
        return this.isPassed() ? "Pass" : "Fail";
    }

    // getDetails() {
    //     // template literals = allow embedding variables directly
    //     // builds and returns a string 
    //     // ${...} says insert the value here
    //     // return `${this.name} - ${this.marks} marks`;
    //     return this.name + " - " + this.marks + " marks ";
    // }

    // isPassed() {
    //     // greater than or equal to
    //     return this.marks >= 40 ? "Pass" : "Fail" ;
    // }

    // getId() {
    //     return this.#id;
    // }

    // static schoolName() {
    //     return " ABC School ";
    // }


    // convert object to plain JSON for local storage
    toJSON() {
        return {
            type: "student",
            name: this.name,
            marks: this.marks,
            id: this.id
        };
    }
    static fromJSON ( obj ){
        return new Student(obj);
    }
}

// child class
class GraduateStudent extends Student {
    #department;

    constructor({name, marks, department, id = null }) {
        // super refers the parent class
        super( { name, marks, id });
        //this.specialization = specialization;
        this.#department = department;
    }
    get department(){
        return this.#department;
    }

    getDetails() {
        return super.getDetails() + " - " + this.department ;
    }

    getGrade() {
        if (this.marks >= 80) return "A" ;
        if (this.marks >= 60) return "B" ;
        return "C";
    }

    getExtraInfo(){
        return "Grade" + this.getGrade() ;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            type: "graduate" ,
            // name: this.name,
            // marks: this.marks,
            // specialization: this.specialization,
            department: this.department
            //id: this.getId()
        };
    }

    static fromJSON(obj) {
        return new GraduateStudent(obj);
    }
}

let students = [];


//AUTHENTICATION LOGIC
function toggleAuth(isSignup){
    document.getElementById("authTitle").innerHTML = isSignup ? "Sign up" : "Login";
    document.getElementById("loginActions").className = isSignup ? "hidden" : "";
    document.getElementById("signupActions").className = isSignup ? "" : "hidden";
}

//store credentials in local storage
function handleSignup(){
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    if(u && p){

        let users = JSON.parse(localStorage.getItem("userCredentials")) || [];
        if(!users) {
            users = [];
        }
        
        else if ( !Array.isArray(users)){
            users = [users];
        };

        users.push ({
            username: u,
            password: p
        });
        localStorage.setItem("userCredentials", JSON.stringify(users));
        alert("Registration Successful! Please Login.");
        toggleAuth(false);
    }else {
        alert("Please fill all fields");
    }
}

//verify against local storage
function authenticateUser(inputUser, inputPass){
    return new Promise((resolve,reject) => {
        const users = JSON.parse(localStorage.getItem("userCredentials"));

        setTimeout(() => {
            if(!users || users.length === 0 ) {
                reject("No user registered yet!!");
                return ;
            } 
            
            const foundUser = users.find( users =>
                users.username === inputUser && users.password === inputPass
            );
            if(foundUser){
                resolve ("Access Granted");
            }else {
                reject ("Invalid Username or password");
            }
        }, 500);
    });
}

async function handleLogin() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    try {
            let result = await authenticateUser(u , p);
            // console.log(result);
            localStorage.setItem("sessionActive", "true");
            localStorage.setItem("currentUser",u);
            window.location.href  = "dashboard.html";
    }catch(err ){
        // console.log(err);
            document.getElementById("authStatus").innerHTML = err;
        }
}


function showDashboard(){
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
}

function checkAuth() {
    if(localStorage.getItem("sessionActive") != "true"){
        window.location.href = "index.html";
    }
}

function logout(){
    localStorage.removeItem("sessionActive");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}


function toggleDepartment(){
    const type = document.getElementById("type").value;
    if(!type) return;
    document.getElementById("deptContainer").style.display = (type === "graduate") ? "block" : "none";
}

// save data to local storage
function saveToLocalStorage() {
    // convert object to string
    const currentUser = localStorage.getItem("currentUser");
    localStorage.setItem("students_" + currentUser, JSON.stringify(students));
}

// take data from local storage
function loadFromLocalStorage() {
    // revert string into object
    const currentUser = localStorage.getItem("currentUser");
    let data = JSON.parse(localStorage.getItem("students_" + currentUser));
    //console.log(data);
    if(!data) return ;
    // obj is each item inside the data array
    // .map loops through each item in array

    students = data.map(obj => {
        //console.log(obj);
        if (obj.type === "graduate") {
            return new GraduateStudent(obj);
        }else {
            return new Student(obj);
        }
    });
    displayStudents();

}

function addStudent() {

    let name = document.getElementById("name").value;
    let marks = Number(document.getElementById("marks").value);
    let type = document.getElementById("type").value;
    let dept = document.getElementById("department").value;

    if (editIndex !== -1){
        // console.log("test1");
        if (type == "graduate") {
            students[editIndex] = new GraduateStudent({
                    name: name,
                    marks: marks,
                    department: dept
                });
        }else {
            //students[editIndex] = new Student(name,marks, students[editIndex].getId());
            students[editIndex] = new Student({
                    name: name,
                    marks: marks
                });
        }
        editIndex = -1;
    }else {
         let student;
        // console.log("test2");
        if(type === "graduate") {
            student = new GraduateStudent({
                name: name,
                marks: marks,
                department: dept
            });
        } else {
            student = new Student({
                name: name,
                marks: marks
            });
        }
        // console.log(student);
        students.push(student);
    }
    //console.log("test3");
    saveToLocalStorage();
    displayStudents();

    //clear inputs
    document.getElementById("name").value = "";
    document.getElementById("marks").value = "";
}

function displayStudents() {
    let output = "";

    students.forEach((s, index) => {
        //console.log(s);
        output += `
        <div class="student-card">
            <div>
                <b>${index + 1}. ${s.name}</b><br>
                Marks: ${s.marks}<br>
                Result: ${s.isPassed()}<br>
                
                ID: ${s.id}
                ${s instanceof GraduateStudent ? `<br>Grade: ${s.getGrade()}` : ""}
                ${s instanceof GraduateStudent ? `<br>Type of student: Graduate` : "<br>Type of student: Regular student"}
                ${s instanceof GraduateStudent ? `<br>Department: ${s.department}` : ""}
            </div>

            <div class="actions">
                <button class="button" onclick="editStudent(${index})">Edit</button>
                <button class="button"onclick="deleteStudent(${index})">Delete</button>
            </div>
        </div>
        `;
    });

    document.getElementById("result").innerHTML = output;
}


function editStudent(index){
    // console.log("edit clicked", index);
    const s = students[index];
    document.getElementById("name").value = s.name;
    document.getElementById("marks").value = s.marks;

    if(s instanceof GraduateStudent) {
        document.getElementById("type").value = "graduate";
        document.getElementById("department").value = s.department;
        document.getElementById("deptContainer").style.display = "block";
    } else {
        document.getElementById("type").value = "student";
        document.getElementById("deptContainer").style.display = "none";
    }

    editIndex = index;
}


//not needed
// function displayStudentsAsynchronous (){
//     new Promise ((resolve, reject ) => {
//         setTimeout(() => {
//             if ( students.length > 0) {
//                 resolve(students);
//             }else {
//                 reject ("No students found");
//             }
//         }, 1000);
//     })
//     .then(data => {
//         let output = "";
//         data.forEach((s,index) => {
//             output += `
//             ${index +1}. ${s.getDetails()} |
//             Result : ${s.isPassed()} |
//             ID: ${s.getId()}
//             `;

//             if(s instanceof GraduateStudent) {
//                 output += ` | Grade: ${s.getGrade()}`;
//             }
//             output += `<button onclick = "deleteStudent(${index})" >Delete</button>
//             <br>`;

//         });

//         output += `<br><b>School : ${Student.schoolName()} </b>`;
//         document.getElementById("result").innerHTML = output;
//     })
//     .catch (err => {
//         document.getElementById("result").innerHTML = err;
//     });
// }


function deleteStudent(index){
    //splice == at index,delete one entry
    students.splice(index,1);
    saveToLocalStorage();
    displayStudents();
}

function clearAll(){
    const currentUser = localStorage.getItem("currentUser");
    localStorage.removeItem("students_"+currentUser);
    students = [];
    displayStudents();
}

window.onload = function() {
    // if(localStorage.getItem("sessionActive") === "true") {
    //     showDashboard();
    // }
    if(window.location.pathname.includes("dashboard.html")){
        checkAuth();
        loadFromLocalStorage();
    }else {
        displayUsers();
    }
};

function displayUsers(){
    let users = JSON.parse(localStorage.getItem("userCredentials"));

    if(!users) return ;

    if(!Array.isArray(users)) {
        users = [users];
    }

    let output = "";
     
    users.forEach(user => {
        output += `
            <button class="user-btn" data-username="${user.username}">
                ${user.username}
            </button><br><br>
        `;
    });

    document.getElementById("userList").innerHTML = output;
    document.querySelectorAll(".user-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.getElementById("username").value =
                this.getAttribute("data-username");
        });
    });
}

function selectUser(username){
    //console.log(username);
    const input = document.getElementById("username").innerHTML = username;
    // console.log(input);
    // input.value = username;
}


