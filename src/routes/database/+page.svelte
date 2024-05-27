<script lang="ts">
	import {
		addDoc,
		collection,
		onSnapshot,
		query,
		QuerySnapshot,
		orderBy,
		deleteDoc,
		doc
	} from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import {
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch,
        Input,
        Select
	} from 'flowbite-svelte';

	type Item = {
		[key: string]: any;
		id?: string;
		name: string;
		group: "暮らし" | "衛生" | "食品関連" | "衣類" | "安全" | "トイレ" | "";
		num: number;
		term: string;
		termH: string;
		zone: string;
	};

	let itemName: string = '';
	let storage: Item[] = [];

	function addItem() {
		if (itemName == '') return;
		const item: Item = {
			name: itemName,
			group: '',
			num: 0,
			term: '',
			termH: '',
			zone: ''
		};
		addDoc(collection(db, 'storage'), item);
		itemName = '';
	}

	function delItem(item: Item) {
		if (!item.id) return;
		deleteDoc(doc(db, 'storage', item.id));
	}

	onSnapshot(query(collection(db, 'storage'), orderBy('name')), (snapshot: QuerySnapshot): any => {
		storage = snapshot.docs.map((doc) => {
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
	});

	let searchTerm: string = '';
	let sortState = { key: 'defaultKey', direction: 'asc' }; // 並び替えの状態

	function sortData(key: string) {
		if (sortState.key === key) {
			sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortState.key = key;
			sortState.direction = 'asc';
		}
	}

    let group = [
        { value: '暮らし', name: '暮らし' },
        { value: '衛生', name: '衛生' },
        { value: '食品関連', name: '食品関連' },
        { value: '衣類', name: '衣類' },
        { value: '安全', name: '安全' },
        { value: 'トイレ', name: 'トイレ' },
        { value: '', name: '未分類' }
    ]

	let filteredStorage: Item[] = [];
	$: {
		if (sortState.key) {
			storage.sort((a, b) => {
				if (!a[sortState.key] || a[sortState.key] === '') return 1;
				if (!b[sortState.key] || b[sortState.key] === '') return -1;

				// 通常のソート
				if (a[sortState.key] < b[sortState.key]) return sortState.direction === 'asc' ? -1 : 1;
				if (a[sortState.key] > b[sortState.key]) return sortState.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		filteredStorage = storage.filter((item) => item.name.includes(searchTerm));
	}
</script>

<div class="flex justify-center h-full w-full flex-col p-12">
	<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Database</Heading
	>
	<div class="flex flex-col sm:flex-row gap-4 mb-4">
        <Input bind:value={searchTerm} placeholder="Item name" class="mb-1" />
        <Select bind:value={itemName} items={group} class="mb-1"/>
    </div>
	<Table class="table w-full overflow-auto">
		<TableHead class="sticky top-0 z-10 bg-gray-200">
			<TableHeadCell class="cursor-pointer" on:click={() => sortData('name')}>Name</TableHeadCell>
			<TableHeadCell >Group</TableHeadCell>
			<TableHeadCell >Num</TableHeadCell>
			<TableHeadCell class="cursor-pointer" on:click={() => sortData('term')}>Term</TableHeadCell>
			<TableHeadCell class="cursor-pointer" on:click={() => sortData('termH')}>TermH</TableHeadCell>
			<TableHeadCell >Zone</TableHeadCell>
			<TableHeadCell></TableHeadCell>
		</TableHead>
		<TableBody>
			{#each filteredStorage as item (item.id)}
				<TableBodyRow class="h-12">
					<TableBodyCell>{item.name}</TableBodyCell>
					<TableBodyCell>{item.group}</TableBodyCell>
					<TableBodyCell>{item.num}</TableBodyCell>
					<TableBodyCell>{item.term}</TableBodyCell>
					<TableBodyCell>{item.termH}</TableBodyCell>
					<TableBodyCell>{item.zone}</TableBodyCell>
					<TableBodyCell>
						<button on:click={() => delItem(item)}>Delete</button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>