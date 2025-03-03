// import { CircleCheck } from "lucide-react";

// export default function AuthLayout() {
//   return (
//     <div className="h-screen w-full flex justify-center  items-center p-4">
//       {/* Centered Card */}
//       <div className="w-[80vw] md:w-[60vw] lg:w-[50vw] h-[50%] bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">
//         {/* Left Section - Image & Text */}
//         <div className="w-full md:w-1/2 flex flex-col text-start items-start p-6">
//           <h2 className="text-2xl font-bold  mb-2  text-start">
//             One Stop Solution for NFA
//           </h2>
//           <p className="text-start text-md text-stone-600 max-w-sm">
//             Join us at NFA to unlock opportunities and achieve success.
//           </p>
//           <div>
//             <h2>Discover what are you missing </h2>
//             <div>
//               <ul className="space-y-3 text-left">
//                 <li className="flex items-center text-green-600">
//                   <CircleCheck className="mr-2" />
//                   Fast
//                 </li>
//                 <li className="flex items-center text-green-600">
//                   <CircleCheck className="mr-2" />
//                   Simple
//                 </li>
//                 <li className="flex items-center text-green-600">
//                   <CircleCheck className="mr-2" />
//                   Responsive
//                 </li>
//               </ul>
//             </div>
//           </div>
//           {/* <img
//             src="https://source.unsplash.com/random/300x200"
//             alt="Motivational Image"
//             className="mt-4 rounded-lg shadow-md"
//           /> */}
//         </div>

//         {/* Right Section - Login Form */}
//         <div className="w-full md:w-1/2 h-full bg-red-400 flex flex-col justify-center items-center p-6"></div>
//       </div>
//     </div>
//   );
// }

import LoginForm from "@/Pages/LoginForm";
import { CircleCheck } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="h-screen w-full flex justify-center items-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Centered Card */}
      <div className="w-full max-w-5xl md:w-[60vw] min-h-[50%] lg:w-[50vw] bg-white shadow-xl shadow-indigo-400/50 rounded-xl flex flex-col md:flex-row overflow-hidden border border-gray-300">
        {/* Left Section - Text */}
        <div className="w-full md:w-1/2 flex flex-col items-start p-6 space-y-4 bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            One Stop Solution for NFA
          </h2>
          <p className="text-md text-gray-600 max-w-sm capitalize">
            Unlock what are you missing...
          </p>
          <div>
            <ul className="space-y-2 ">
              <li className="flex items-center text-blue-600 font-medium">
                <CircleCheck className="mr-2 text-green-500" /> Fast
              </li>
              <li className="flex items-center text-blue-600 font-medium">
                <CircleCheck className="mr-2 text-green-500" /> Simple
              </li>
              <li className="flex items-center text-blue-600 font-medium">
                <CircleCheck className="mr-2 text-green-500" /> Responsive
              </li>
              <li className="flex items-center text-blue-600 font-medium ">
                <CircleCheck className=" text-green-500 mr-2" /> Secure
              </li>
            </ul>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full md:w-1/2 h-full bg-white flex flex-col justify-center items-center p-6 shadow-inner">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-center mb-4">Sign in to continue</p>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
