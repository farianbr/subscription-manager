// import { cn } from "../../lib/utils";

// export function GridBackground({ children }) {
//   return (
//     <div className="relative flex h-[50rem] w-full items-center justify-center bg-white dark:bg-black">
//       <div
//         className={cn(
//           "absolute inset-0",
//           "[background-size:40px_40px]",
//           "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
//           "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
//         )}
//       />
//       {/* Radial gradient for the container to give a faded look */}
//       <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
//       <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
//         {children}
//       </p>
//     </div>
//   );
// }


const GridBackground = ({ children }) => {
	return (
		<div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden'>
			{/* Subtle grid pattern */}
			<div className='absolute inset-0 bg-grid-slate-300/[0.04] [mask-image:radial-gradient(ellipse_at_center,white_70%,transparent)]'></div>
			
			{/* Professional gradient orbs */}
			<div className='absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-float'></div>
			<div className='absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-500/20 rounded-full blur-3xl animate-float' style={{animationDelay: '1s'}}></div>
			<div className='absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-float' style={{animationDelay: '2s'}}></div>
			
			{/* Decorative elements */}
			<div className='absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse'></div>
			<div className='absolute top-32 right-32 w-1 h-1 bg-indigo-500 rounded-full opacity-40 animate-pulse' style={{animationDelay: '1s'}}></div>
			<div className='absolute bottom-32 left-32 w-1.5 h-1.5 bg-violet-400 rounded-full opacity-50 animate-pulse' style={{animationDelay: '2s'}}></div>
			
			{/* Content with proper padding */}
			<div className='relative z-10 min-h-screen flex flex-col'>
				{children}
			</div>
		</div>
	);
};
export default GridBackground;