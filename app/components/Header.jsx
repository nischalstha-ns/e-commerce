
export default function Header(){
    const menulist=[
        {
            name:"Home",
            link:"/",
        },
        {
            name:"About Us",
            link:"/about-us",
        },
        {
            name:"Contact Us",
            link:"/contact-us",
        },
    ];
    return (
                
              <nav className="py-3 px-14 border-b flex item-center justify-between">
                <img className="h-10" src="/logo.jpg" alt="" />

                <div className="flex gap-4 items-center font-semibold">
  {menulist?.map((item) => {
    return (
      <a key={item?.link} href={item?.link} className="hover:text-blue-600">
        <button>{item?.name}</button>
      </a>
    );
  })}
</div>

<a href="/login">
  <button className="bg-blue-600 px-3 py-3 rounded-full text-white">
    Login
  </button>
</a>

              </nav>
            );
          };
          