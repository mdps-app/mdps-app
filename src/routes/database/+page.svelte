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
	import { db, type Item } from '$lib/firebase';
	import { getAuth, onAuthStateChanged } from 'firebase/auth';
	import { onMount } from 'svelte';
	import {
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Input,
		MultiSelect,
		SpeedDial,
		SpeedDialButton,
		Button,
		Modal,
		Select
	} from 'flowbite-svelte';
	import { FileCirclePlusOutline, ArrowLeftToBracketOutline } from 'flowbite-svelte-icons';

	let auth: any = null;

	let storage: Item[] = [];

	onMount(async () => {
		const firebaseAuth = getAuth();
		onAuthStateChanged(firebaseAuth, (user) => {
			auth = user;
		});
	});

	onSnapshot(query(collection(db, 'storage'), orderBy('name')), (snapshot: QuerySnapshot) => {
		storage = snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				name: data.name,
				group: data.group,
				num: data.num,
				term: data.term,
				termH: data.termH,
				zone: data.zone
			};
		});
	});

	let itemName: string = '';
	let itemGroup: '' | '暮らし' | '衛生' | '食品関連' | '衣類' | '安全' | 'トイレ' = '';
	let itemNum: number = 0;
	let itemTerm: string = '';
	let itemTermH: string = '';
	let itemZone: string = '';

	let createModal = false;

	function addItem() {
		if (itemName == '') return;
		const item: Item = {
			name: itemName,
			group: itemGroup,
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

	function isWithinOneYear(dateStr: string | number | Date) {
		const date = new Date(dateStr);
		const now = new Date();
		const halfYearAgo = new Date();
		halfYearAgo.setMonth(now.getMonth() + 6);
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(now.getFullYear() + 1);

		if (date <= halfYearAgo) {
			return 'bg-red-100';
		} else if (date <= oneYearAgo) {
			return 'bg-yellow-100';
		} else {
			return 'none';
		}
	}

	let searchTerm: string = '';
	let sortState = { key: 'defaultKey', direction: 'asc' };

	function sortData(key: string) {
		if (sortState.key === key) {
			sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortState.key = key;
			sortState.direction = 'asc';
		}
	}

	let selected: any[] = [];

	let group = [
		{ value: '暮らし', name: '暮らし' },
		{ value: '衛生', name: '衛生' },
		{ value: '食品関連', name: '食品関連' },
		{ value: '衣類', name: '衣類' },
		{ value: '安全', name: '安全' },
		{ value: 'トイレ', name: 'トイレ' },
		{ value: '', name: '未分類' }
	];

	let filteredStorage: Item[] = [];
	$: {
		if (sortState.key) {
			storage.sort((a, b) => {
				if (!a[sortState.key] || a[sortState.key] === '') return 1;
				if (!b[sortState.key] || b[sortState.key] === '') return -1;

				if (a[sortState.key] < b[sortState.key]) return sortState.direction === 'asc' ? -1 : 1;
				if (a[sortState.key] > b[sortState.key]) return sortState.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		filteredStorage = storage.filter((item) => {
			const nameMatches = item.name.includes(searchTerm);
			const groupMatches = selected.length === 0 || selected.includes(item.group);
			return nameMatches && groupMatches;
		});
	}
</script>

{#if auth}
	<SpeedDial color="cyan" shadow="cyan" gradient class="absolute bottom-20 end-6 z-10">
		<SpeedDialButton name="import">
			<ArrowLeftToBracketOutline />
		</SpeedDialButton>
		<SpeedDialButton name="Add" on:click={() => (createModal = true)}>
			<FileCirclePlusOutline />
		</SpeedDialButton>
	</SpeedDial>
{/if}
<Modal title="Add new item" bind:open={createModal} autoclose>
	<Input bind:value={itemName} placeholder="Item name" />
	<Select bind:value={itemGroup} items={group} placeholder="Group" />
	<Input bind:value={itemNum} placeholder="Number" />
	<Input bind:value={itemTerm} placeholder="Term" type="date" />
	<Input bind:value={itemTermH} placeholder="TermH" type="date" />
	<Input bind:value={itemZone} placeholder="Zone" />
	<svelte:fragment slot="footer">
		<Button on:click={() => addItem()}>Add item</Button>
		<Button color="alternative">cancel</Button>
	</svelte:fragment>
</Modal>
<div class="flex h-full w-full flex-col justify-center p-12">
	<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Database</Heading
	>
	<div class="mb-4 flex flex-col gap-4">
		<Input bind:value={searchTerm} placeholder="Item name" class="mb-1" />
		<MultiSelect items={group} bind:value={selected} />
	</div>
	<Table class="table w-full overflow-auto" hoverable={true} shadow>
		<TableHead class="sticky top-0 z-10 bg-gray-200">
			<TableHeadCell class="cursor-pointer" on:click={() => sortData('name')}>Name</TableHeadCell>
			<TableHeadCell>Group</TableHeadCell>
			<TableHeadCell>Num</TableHeadCell>
			<TableHeadCell class="cursor-pointer" on:click={() => sortData('term')}>Term</TableHeadCell>
			<TableHeadCell class="cursor-pointer" on:click={() => sortData('termH')}>TermH</TableHeadCell>
			<TableHeadCell>Zone</TableHeadCell>
			<TableHeadCell></TableHeadCell>
		</TableHead>
		<TableBody>
			{#each filteredStorage as item (item.id)}
				<TableBodyRow class={`h-12 ${isWithinOneYear(item.term)}`}>
					<TableBodyCell>{item.name}</TableBodyCell>
					<TableBodyCell>{item.group}</TableBodyCell>
					<TableBodyCell>{item.num}</TableBodyCell>
					<TableBodyCell>{item.term}</TableBodyCell>
					<TableBodyCell>{item.termH}</TableBodyCell>
					<TableBodyCell>{item.zone}</TableBodyCell>
					<TableBodyCell>
						<Button color="alternative" href='database/storage?id={item.id}'>More</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>

<style lang="scss">
	.table {
		.red {
			background-color: red !important;
		}
		.yellow {
			background-color: yellow !important;
		}
		.green {
			background-color: white !important;
		}
	}
</style>