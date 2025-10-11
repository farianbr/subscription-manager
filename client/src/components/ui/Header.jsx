import { Link } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { useMutation, useQuery } from "@apollo/client/react";
import { LOGOUT } from "../../graphql/mutations/user.mutation";
import { GET_AUTHENTICATED_USER } from "../../graphql/queries/user.queries";

const Header = () => {
	const { data: authUserData } = useQuery(GET_AUTHENTICATED_USER);
	const [logout, { loading, client }] = useMutation(LOGOUT, {
		refetchQueries: ["GET_AUTHENTICATED_USER"],
	});

	const handleLogout = async () => {
		try {
			await logout();
			client.resetStore();
		} catch (err) {
			console.error(err.message);
		}
	};

	return (
		<header className='bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] shadow-sm'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					{/* Logo */}
					<Link to='/' className='flex items-center space-x-2'>
						<div className='w-8 h-8 rounded-lg flex items-center justify-center'>
							<img src='/favicon/favicon.svg' alt='Logo' className='w-8 h-8' />
						</div>
						<span className='text-xl font-bold text-slate-800'>Subscription Manager</span>
					</Link>

					{/* User Profile */}
					<div className='flex items-center space-x-4'>
						<div className='flex items-center space-x-3 bg-slate-50 rounded-xl px-4 py-2'>
							<img
								src={authUserData?.authUser.profilePicture}
								className='w-8 h-8 rounded-full ring-2 ring-blue-200 object-cover'
								alt='Profile'
							/>
							<div className='hidden md:block'>
								<p className='text-slate-800 font-semibold text-sm'>{authUserData?.authUser.name}</p>
								{authUserData?.authUser.username && (
									<p className='text-slate-500 text-xs'>@{authUserData.authUser.username}</p>
								)}
							</div>
						</div>
						{!loading && (
							<button
								onClick={handleLogout}
								className='group flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors duration-300 p-2 rounded-lg hover:bg-red-50'
							>
								<MdLogout className='w-5 h-5 group-hover:rotate-12 transition-transform duration-300' />
							</button>
						)}
						{loading && (
							<div className='w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin'></div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};
export default Header;