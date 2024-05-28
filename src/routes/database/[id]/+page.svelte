<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { page } from '$app/stores';
	import { auth, db, type Item } from '$lib/firebase';
	import {
		QuerySnapshot,
		collection,
		doc,
		onSnapshot,
		orderBy,
		query,
		updateDoc
	} from 'firebase/firestore';
	import {
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Img,
		Skeleton,
		ImagePlaceholder,
		Input,
		Button,
		Modal,
		Select
	} from 'flowbite-svelte';
	import Map from '$lib/component/Map.svelte';

	let storage: Item[] = [];
	let matchedItem: Item | undefined;
	let quCodeUrl: any = '';

	let itemName: string;
	let itemGroup: '' | '暮らし' | '衛生' | '食品関連' | '衣類' | '安全' | 'トイレ';
	let itemNum: number;
	let itemTerm: string;
	let itemTermH: string;
	let itemZone: string;

	onMount(async () => {
		const { params } = await $page;
		const id = params.id;

		onSnapshot(
			query(collection(db, 'storage'), orderBy('name')),
			(snapshot: QuerySnapshot): any => {
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

				matchedItem = storage.find((item) => item.id === id);

				if (matchedItem) {
					itemName = matchedItem.name;
					itemGroup = matchedItem.group;
					itemNum = matchedItem.num;
					itemTerm = matchedItem.term ? new Date(matchedItem.term).toISOString().split('T')[0] : '';
					itemTermH = matchedItem.termH
						? new Date(matchedItem.termH).toISOString().split('T')[0]
						: '';
					itemZone = matchedItem.zone;
				}
			}
		);

		if (typeof window !== 'undefined') {
			quCodeUrl = await QRCode.toDataURL(window.location.href);
		}
	});

	let editMordal = false;

	let group = [
		{ value: '暮らし', name: '暮らし' },
		{ value: '衛生', name: '衛生' },
		{ value: '食品関連', name: '食品関連' },
		{ value: '衣類', name: '衣類' },
		{ value: '安全', name: '安全' },
		{ value: 'トイレ', name: 'トイレ' },
		{ value: '', name: '未分類' }
	];

	function updateItem(item: Item) {
		if (!item.id) return;
		const newItem: Item = {
			name: itemName,
			group: itemGroup,
			num: itemNum,
			term: itemTerm,
			termH: itemTermH,
			zone: itemZone
		};

		updateDoc(doc(db, 'storage', item.id), newItem);
	}
</script>

{#if matchedItem}
	<Modal title="Add new item" bind:open={editMordal} autoclose>
		<Input bind:value={itemName} placeholder="Item name" />
		<Select bind:value={itemGroup} items={group} placeholder="Group" />
		<Input bind:value={itemNum} placeholder="Number" />
		<Input bind:value={itemTerm} placeholder="Term" type="date" />
		<Input bind:value={itemTermH} placeholder="TermH" type="date" />
		<Input bind:value={itemZone} placeholder="Zone" />
		<svelte:fragment slot="footer">
			<Button on:click={() => matchedItem && updateItem(matchedItem)}>Add item</Button>
			<Button color="alternative">cancel</Button>
		</svelte:fragment>
	</Modal>
{/if}

<div class="p-12">
	<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Database</Heading
	>
	<Table class="table w-full overflow-auto" hoverable={true} shadow>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Group</TableHeadCell>
			<TableHeadCell>Number</TableHeadCell>
			<TableHeadCell>Term</TableHeadCell>
			<TableHeadCell>TermH</TableHeadCell>
			<TableHeadCell>Zone</TableHeadCell>
			<TableHeadCell></TableHeadCell>
		</TableHead>
		<TableBody>
			<TableBodyRow>
				{#if matchedItem}
					<TableBodyCell>{matchedItem.name}</TableBodyCell>
					<TableBodyCell>{matchedItem.group}</TableBodyCell>
					<TableBodyCell>{matchedItem.num}</TableBodyCell>
					<TableBodyCell>{matchedItem.term}</TableBodyCell>
					<TableBodyCell>{matchedItem.termH}</TableBodyCell>
					<TableBodyCell>{matchedItem.zone}</TableBodyCell>
					<TableBodyCell>
						<button on:click={() => (editMordal = true)}>Edit</button>
					</TableBodyCell>
				{:else}
					<TableBodyCell></TableBodyCell>
				{/if}
			</TableBodyRow>
		</TableBody>
	</Table>
	{#if matchedItem}
		<div class="mt-10 flex flex-col gap-4 sm:flex-row">
			<Map point={matchedItem.zone} />
			<Img src={quCodeUrl} alt="QRコード" class="rounded-lg shadow-xl dark:shadow-gray-800" />
		</div>
	{:else}
		<div class="mt-10">
			<Skeleton class="h-64 w-64" />
			<ImagePlaceholder class="h-64 w-64" />
		</div>
	{/if}
</div>
