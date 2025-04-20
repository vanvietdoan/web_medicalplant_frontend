<template>
  <div class="order-edit">
    <h1>Edit Order</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Name:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.Name" 
            required
          />
        </div>
        <div class="form-group">
          <label for="class">Class:</label>
          <select 
            id="class" 
            v-model="formData.Class_ID" 
            required
          >
            <option value="">Select Class</option>
            <option 
              v-for="classItem in classes" 
              :key="classItem.Class_ID" 
              :value="classItem.Class_ID"
            >
              {{ classItem.Name }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Update Order</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Order } from '../../../models/Order';

const route = useRoute();
const router = useRouter();
const formData = ref<Order>({
  Order_ID: 0,
  Name: '',
  Class_ID: 0
});
const classes = ref<{ Class_ID: number; Name: string }[]>([]);

const fetchOrder = async (id: number) => {
  try {
    // TODO: Implement API call to fetch order
    // const response = await orderService.getById(id);
    // formData.value = response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
  }
};

const fetchClasses = async () => {
  try {
    // TODO: Implement API call to fetch classes
    // classes.value = await classService.getAll();
  } catch (error) {
    console.error('Error fetching classes:', error);
  }
};

const handleSubmit = async () => {
  try {
    // TODO: Implement API call to update order
    // await orderService.update(formData.value);
    router.push({ name: 'listOrder' });
  } catch (error) {
    console.error('Error updating order:', error);
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchOrder(id);
  }
  fetchClasses();
});
</script>

<style scoped>
.order-edit {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}
</style> 