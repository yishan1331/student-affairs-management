import { createContext, useContext, ReactNode, useState } from 'react';
import { IUser } from '../common/types/models';

interface UserContextType {
	user: IUser | null;
	setUser: (user: IUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};
