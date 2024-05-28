<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { page } from '$app/stores';
	import { auth, db, type Item } from '$lib/firebase';
	import { QuerySnapshot, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
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
		ImagePlaceholder
	} from 'flowbite-svelte';

	let storage: Item[] = [];
	let matchedItem: Item | undefined;
	let quCodeUrl: any = '';

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
			}
		);

		if (typeof window !== 'undefined') {
			quCodeUrl = await QRCode.toDataURL(window.location.href);
		}
	});
</script>

<div class="p-12">
	<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Database</Heading
	>

	{#if matchedItem}
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
					<TableBodyCell>{matchedItem.name}</TableBodyCell>
					<TableBodyCell>{matchedItem.group}</TableBodyCell>
					<TableBodyCell>{matchedItem.num}</TableBodyCell>
					<TableBodyCell>{matchedItem.term}</TableBodyCell>
					<TableBodyCell>{matchedItem.termH}</TableBodyCell>
					<TableBodyCell>{matchedItem.zone}</TableBodyCell>
					<TableBodyCell>Edit</TableBodyCell>
				</TableBodyRow>
			</TableBody>
		</Table>
		<div class="mt-10">
			<Img src={quCodeUrl} alt="QRコード" class="shadow-xl dark:shadow-gray-800 rounded-lg" />
		</div>
	{:else}
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
					<TableBodyCell>
					</TableBodyCell>
				</TableBodyRow>
			</TableBody>
		</Table>
		<div class="mt-10">
			<ImagePlaceholder class="w-64 h-64" />
		</div>
	{/if}
</div>
