<template>
    <div>
        <div>Button.vue</div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
    .r-button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .r-button:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    }
</style>