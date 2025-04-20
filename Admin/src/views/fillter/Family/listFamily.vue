<template>
  <div class="family-list">
    <h1>Family List</h1>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="family in families" :key="family.Family_ID">
            <td>{{ family.Family_ID }}</td>
            <td>{{ family.Name }}</td>
            <td>{{ getOrderName(family.Order_ID) }}</td>
            <td>
              <button @click="editFamily(family)" class="btn btn-edit">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Family } from '../../../models/Family';

const router = useRouter();
const families = ref<Family[]>([]);
const orders = ref<{ Order_ID: number; Name: string }[]>([]);

const fetchFamilies = async () => {
  try {
    // TODO: Implement API call to fetch families
    // families.value = await familyService.getAll();
  } catch (error) {
    console.error('Error fetching families:', error);
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

const getOrderName = (orderId: number) => {
  const order = orders.value.find(o => o.Order_ID === orderId);
  return order ? order.Name : '';
};

const editFamily = (family: Family) => {
  router.push({ name: 'editFamily', params: { id: family.Family_ID } });
};

onMounted(() => {
  fetchFamilies();
  fetchOrders();
});
</script>

<style scoped>
.family-list {
  padding: 20px;
}

.table-container {
  margin-top: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.table th {
  background-color: #f5f5f5;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}
</style> 