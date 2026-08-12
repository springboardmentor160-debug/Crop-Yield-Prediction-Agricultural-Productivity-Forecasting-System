async function registerUser() {

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;

    const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role
            })
        }
    );

    const data = await response.json();

    alert(data.message);
}

async function loginUser() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (data.access_token) {

    localStorage.setItem(
        "token",
        data.access_token
    );

    localStorage.setItem(
        "name",
        data.user.name
    );

    localStorage.setItem(
        "email",
        data.user.email
    );

    localStorage.setItem(
        "role",
        data.user.role
    );

    alert("✅ Login Successful");

    window.location.href =
        "dashboard.html";
}
    else {

        alert("❌ Login Failed");
    }
}