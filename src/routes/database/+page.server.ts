import { collection, getDocs, orderBy, query, QuerySnapshot } from 'firebase/firestore';
import { db, type Item } from '$lib/firebase';
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const itemsCol = collection(db, 'storage');

    const snapshot: QuerySnapshot = await getDocs(query(itemsCol, orderBy('name')));

    const items: Item[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const item: Item = {
            id: doc.id,
            name: data.name,
            group: data.group,
            num: data.num,
            term: data.term,
            termH: data.termH,
            zone: data.zone
        };
        return item;
    });

    return {
        data: items
    };
}