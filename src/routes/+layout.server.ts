import { collection, getDocs } from 'firebase/firestore';
import { db, type Item } from '$lib/firebase';

export async function load({ page, fetch }) {
    const itemsCol = collection(db, 'storage');
    const itemSnapshot = await getDocs(itemsCol);
    const items = itemSnapshot.docs.map(doc => doc.data());

    return {
        props: {
            items: items as Item[]
        }
    };
}
