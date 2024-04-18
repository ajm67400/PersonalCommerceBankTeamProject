import { User } from "../api/api-types";

type Role = "user" | "admin"
type GetUser = User | null;
type SetUserFunc = (u: User) => void;
type LogoutUserFunc = () => void;
type UserContext = [User, LogoutUserFunc];

export type {
	Role,
	GetUser,
	SetUserFunc,
	LogoutUserFunc,
	UserContext,
}
