import { Link } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
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
		<header className='bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					{/* Logo */}
					<Link to='/' className='flex items-center space-x-2 hover:opacity-80 transition-opacity'>
						<div className='w-8 h-8 rounded-lg flex items-center justify-center'>
							<img src='/favicon/favicon.svg' alt='Logo' className='w-8 h-8' />
						</div>
						<span className='text-lg font-bold text-slate-900'>Subscription Manager</span>
					</Link>

					{/* User Profile */}
					<div className='flex items-center space-x-3'>
						<div className='flex items-center space-x-3 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200'>
							{authUserData?.authUser.profilePicture ? (
								<img
									src={authUserData.authUser.profilePicture}
									className='w-8 h-8 rounded-full object-cover border border-slate-200'
									alt='Profile'
								/>
							) : (
								<div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm'>
									{authUserData?.authUser.name
										?.split(' ')
										.map(n => n[0])
										.join('')
										.toUpperCase()
										.slice(0, 2) || 'U'}
								</div>
							)}
							<div className='hidden sm:block'>
								<p className='text-slate-900 font-medium text-sm'>{authUserData?.authUser.name}</p>
								{authUserData?.authUser.username && (
									<p className='text-slate-500 text-xs'>@{authUserData.authUser.username}</p>
								)}
							</div>
						</div>
						<Link
							to='/settings'
							className='p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200'
							title="Settings"
						>
							<IoSettingsSharp className='w-5 h-5' />
						</Link>
						{!loading && (
							<button
								onClick={handleLogout}
								className='p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200'
								title="Logout"
							>
								<MdLogout className='w-5 h-5' />
							</button>
						)}
						{loading && (
							<div className='w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin'></div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};
export default Header;