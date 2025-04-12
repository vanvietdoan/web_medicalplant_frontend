<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { User } from '../../models/User'
import { userService } from '../../services/user.service'

const router = useRouter()
const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const showEditModal = ref(false)
const selectedUser = ref<User | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.full_name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (user: User) => {
  router.push({
    name: 'user-edit',
    params: { id: user.user_id },
    query: {
      full_name: user.full_name,
      email: user.email,
      title: user.title,
      proof: user.proof,
      specialty: user.specialty,
      active: user.active.toString(),
      avatar: user.avatar,
      role_id: user.role_id.toString()
    }
  })
}

const handleDelete = async (userId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      await userService.deleteUser(userId)
      ElMessage.success('Xóa người dùng thành công')
      await fetchUsers()
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    ElMessage.error('Không thể xóa người dùng')
  }
}

const handleSubmit = async () => {
  if (!selectedUser.value) return
  
  try {
    loading.value = true
    await userService.updateUser(selectedUser.value.user_id, {
      full_name: selectedUser.value.full_name,
      title: selectedUser.value.title,
      proof: selectedUser.value.proof,
      specialty: selectedUser.value.specialty,
      active: selectedUser.value.active,
      email: selectedUser.value.email,
      role_id: selectedUser.value.role_id
    })
    ElMessage.success('Cập nhật thông tin thành công')
    await fetchUsers()
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating user:', error)
    ElMessage.error('Không thể cập nhật thông tin')
  } finally {
    loading.value = false
  }
}

const handleAvatarUpload = async (event: Event) => {
  if (!selectedUser.value) return
  
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      loading.value = true
      const response = await userService.uploadAvatar(selectedUser.value.user_id, input.files[0])
      selectedUser.value.avatar = response.avatar_url
      ElMessage.success('Cập nhật ảnh đại diện thành công')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      ElMessage.error('Không thể cập nhật ảnh đại diện')
    } finally {
      loading.value = false
    }
  }
}

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await userService.getUsers()
    console.log('API Response:', response)
    users.value = response.data
    console.log('Users data:', users.value)
  } catch (error) {
    console.error('Error fetching users:', error)
    ElMessage.error('Không thể tải danh sách người dùng')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push({ name: 'user-create' })
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý người dùng</h2>
     
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm người dùng..." 
          class="search-input"
        />
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Tạo tài khoản
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Email</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.user_id">
          <td>{{ user.user_id }}</td>
          <td>{{ user.full_name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="['status', user.active ? 'active' : 'inactive']">
              {{ user.active ? 'Hoạt động' : 'Không hoạt động' }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(user)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(user.user_id)" class="btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Modal -->
    <div v-if="showEditModal && selectedUser" class="modal">
      <div class="modal-content">
        <h3>Cập nhật thông tin người dùng</h3>
        <form @submit.prevent="handleSubmit">
          <div class="avatar-section">
            <img :src="selectedUser.avatar || '/placeholder-avatar.jpg'" class="avatar-preview" alt="Avatar">
            <div class="avatar-upload">
              <input type="file" accept="image/*" @change="handleAvatarUpload">
              <button type="button" class="btn-upload">Tải ảnh lên</button>
            </div>
          </div>

          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="selectedUser.full_name" type="text" required>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="selectedUser.email" type="email" required>
          </div>

          <div class="form-group">
            <label>Chức danh</label>
            <input v-model="selectedUser.title" type="text" required>
          </div>

          <div class="form-group">
            <label>Bằng cấp</label>
            <input v-model="selectedUser.proof" type="text" required>
          </div>

          <div class="form-group">
            <label>Chuyên môn</label>
            <input v-model="selectedUser.specialty" type="text" required>
          </div>

          <div class="form-group">
            <label>Vai trò</label>
            <select v-model="selectedUser.role_id" required>
              <option value="1">Người dùng</option>
              <option value="2">Người kiểm duyệt</option>
              <option value="3">Quản trị viên</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="selectedUser.active">
              Kích hoạt tài khoản
            </label>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
            <button type="button" class="btn-cancel" @click="showEditModal = false">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  flex: 0 0 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-edit {
  background: #2196F3;
}

.btn-delete {
  background: #f44336;
}

.btn-edit:hover {
  background: #1976D2;
}

.btn-delete:hover {
  background: #D32F2F;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status.active {
  background: #e8f5e9;
  color: #4CAF50;
}

.status.inactive {
  background: #ffebee;
  color: #f44336;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-upload input[type="file"] {
  display: none;
}

.btn-upload {
  background: #2196F3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-save,
.btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}
</style>
