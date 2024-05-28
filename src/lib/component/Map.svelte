<script lang="ts">
    import { Card, P } from "flowbite-svelte";

    export let point: any;
</script>

<div class="w-full h-full">
    <Card class="w-full h-full">
        {point}
    </Card>
</div>