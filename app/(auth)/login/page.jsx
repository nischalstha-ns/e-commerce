export default function Page(){
    return (
        <main className="w-full flex justify-center item-center bg-gray-300 p-24 min-h-screen">
            <section className="flex flex-col gap-3">
                <div>
                <img className="h-24" src="/logo.jpg" alt="logo" />
                </div>
                {/* <div className="bg-white p-10 rounded-x1 min-w-[540px]"></div> */}
                <h1 className="font-bold text-x1">Login with Email</h1>
                <form className="flex flex-col gap-3">
                    
                        <input 
                        placeholder="Enter your Email" 
                        type="email" 
                        name="user-email" 
                        id="user-email" 
                        className="px-3 py-2 rounded border focus:outline-none w-full"
                         />
                         <input 
                        placeholder="Enter your Password" 
                        type="password" 
                        name="user-password" 
                        id="user-password" 
                        className="px-3 py-2 rounded border focus:outline-none w-full"
                         />
                         <button>Login</button>
                    
                </form>
            </section>
        </main>
    );

}