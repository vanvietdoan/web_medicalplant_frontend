import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { diseasesService } from '../../services/diseases.service';
import { adviceService } from '../../services/advice.service';
import type { Diseases } from '../../models/Diseases';
import type { Advice } from '../../models/Advice';

const route = useRoute();
const disease = ref<Diseases | null>(null);
const advices = ref<Advice[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchDiseaseDetail = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const diseaseId = Number(route.params.id);
    const [diseaseResponse, advicesResponse] = await Promise.all([
      diseasesService.getDiseaseById(diseaseId),
      adviceService.getAdviceByDiseaseID(diseaseId)
    ]);
    disease.value = diseaseResponse;
    advices.value = advicesResponse;
  } catch (err) {
    error.value = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
    console.error('Error fetching disease details:', err);
  } finally {
    isLoading.value = false;
  }
}; 