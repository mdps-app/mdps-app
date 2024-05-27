import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

export function setupAuthListener(updateUser: (arg0: User | null) => void) {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    updateUser(user);
  });

  return unsubscribe;
}