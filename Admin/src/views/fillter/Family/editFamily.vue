<template>
  <div class="family-edit">
    <h1>{{ isEdit ? 'Edit Family' : 'Create Family' }}</h1>
    <form @submit.prevent="saveFamily" class="form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          v-model="family.Name"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="order">Order:</label>
        <select
          id="order"
          v-model="family.Order_ID"
          required
          class="form-control"
        >
          <option value="">Select Order</option>
          <option
            v-for="order in orders"
            :key="order.Order_ID"
            :value="order.Order_ID"
          >
            {{ order.Name }}
          </option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn btn-cancel">Cancel</button>
        <button type="submit" class="btn btn-save">
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Family } from '../../../models/Family';

const route = useRoute();
const router = useRouter();
const family = ref<Family>({
  Family_ID: 0,
  Name: '',
  Order_ID: 0
});
const orders = ref<{ Order_ID: number; Name: string }[]>([]);

const isEdit = computed(() => route.params.id !== undefined);

const fetchFamily = async (id: number) => {
  try {
    // TODO: Implement API call to fetch family by ID
    // family.value = await familyService.getById(id);
  } catch (error) {
    console.error('Error fetching family:', error);
  }
};

const fetchOrders = async () => {
  try {
    // TODO: Implement API call to fetch orders
    // orders.value = await orderService.getAll();
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const saveFamily = async () => {
  try {
    if (isEdit.value) {
      // TODO: Implement API call to update family
      // await familyService.update(family.value);
    } else {
      // TODO: Implement API call to create family
      // await familyService.create(family.value);
    }
    goBack();
  } catch (error) {
    console.error('Error saving family:', error);
  }
};

const goBack = () => {
  router.push({ name: 'listFamily' });
};

onMounted(() => {
  fetchOrders();
  if (isEdit.value) {
    const id = parseInt(route.params.id as string);
    if (!isNaN(id)) {
      fetchFamily(id);
    }
  }
});
</script>

<style scoped>
.family-edit {
  padding: 20px;
}

.form {
  max-width: 500px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}
</style> 