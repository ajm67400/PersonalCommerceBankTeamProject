import { User } from "../../api/api-types";

const UserContextElement = ({ user, hide }: {
	user: User|null,
	hide?: boolean,
}) => {
	if (hide) return null;
	if (!user) return;
	return (	
		<div className="user-details">              
		  <p>Logged in as {user.user_id}</p>
		  <p>User rights: {user.user_role}</p>
		</div>
	)
}

export default UserContextElement
