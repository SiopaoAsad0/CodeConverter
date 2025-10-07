import { useState } from "react"

const Login = () => {
    const [passwordValue, setPasswordValue] = useState("");
    const [usernameValue, setUsernameValue] = useState("");
  
    const handlePasswordChange = (e) => setPasswordValue(e.target.value)
    const handleUsernameChange = (e) => setUsernameValue(e.target.value)
    const handleSubmit = (e) => {
        e.preventDefault()
        
        const payload = {
            email: usernameValue,
            password: passwordValue
        }

        console.log(payload)
        fetch("http://localhost:8000/api/clinic/login", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(res => {
            if(res.message == "No Account Found") {
                document.getElementById('invalid_credentials').showModal()
            } else {
                // const token = res.token
                // localStorage.setItem("token", token);
                window.location.href = "/dashboard"
            }
        })
    }
   
    return (
        <div className="bg-base-200 flex justify-center items-center">
            <div className="hero-content w-screen h-screen flex-col lg:flex-row-reverse">
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <form className="card-body">
                        <h1 className='text-[40px] font-medium text-center'>Login</h1>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                               
                                <input type="text" className="grow" placeholder="Username" value={usernameValue} onChange={handleUsernameChange} />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                
                                <input type="password" className="grow" placeholder="Password" value={passwordValue} onChange={handlePasswordChange}/>
                            </label>
                        </div>
                        <div className="form-control mt-6">
                        <button className="btn btn-primary mb-2" onClick={handleSubmit}>Login</button>
                        <button className="btn btn-primary mb-2" onClick={handleSubmit}>Register</button>

                        <dialog id="invalid_credentials" className="modal w-screen h-screen">
                            <div className="modal-box border-2 border-error">
                                <h3 className="font-bold text-lg">Invalid Credentials</h3>
                                <p className="py-4">No account found from the given credentials</p>
                                <div className="modal-action">
                                <form method="dialog">
                    
                                    <button className="btn btn-error hover:bg-red-500">Ok</button>
                                </form>
                                </div>
                            </div>
                        </dialog>
                        {/* <button className="btn btn-secondary bg-transparent">Signup</button> */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
  )
}

export default Login
