<template>
  <n-modal :show="isOpen">
    <n-card
      style="max-width: 600px"
      title="Register DataSource"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-form :model="formValue" :rules="rules" size="medium" ref="formRef">
        <n-form-item label="Url" path="url">
          <n-input
            v-model:value="formValue.url"
            placeholder="Service Url"
            clearable
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end" size="small">
          <n-button strong secondary type="error" @click="emit('close')"
            >Cancel</n-button
          >
          <n-button
            type="primary"
            :disabled="createDisabled"
            @click="createDataSource"
            >Create</n-button
          >
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { useDataSources } from '@/core/stores/dataSources';
import {
  NModal,
  NCard,
  NSpace,
  NButton,
  NFormItem,
  NInput,
  NForm,
  FormRules,
  FormInst,
  FormItemRule,
  FormValidationError,
} from 'naive-ui';
import { defineProps, defineEmits, ref, watch } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const dataSources = useDataSources();
const formRef = ref<FormInst | null>(null);
const createDisabled = ref(false);
const formValue = ref({
  url: '',
});
const rules: FormRules = {
  url: {
    required: true,
    trigger: ['input', 'blur'],
    validator: (_rule: FormItemRule, value: string) => {
      if (!value) {
        return new Error('The url is required');
      } else if (
        !/^http(s?):\/\/(localhost|(\d{1,3}\.){3}\d{1,3}|(.*\.)?(.*)\.(.*))(:\d{1,5})?\/$/.test(
          value,
        )
      ) {
        return new Error(
          'The url should follow the schema http(s?)://<your-domain>/',
        );
      }
      return true;
    },
  },
};

watch(formRef, (value) => {
  value?.validate((errors: Array<FormValidationError> | undefined) => {
    createDisabled.value = !errors;
  });
});

const createDataSource = (e: MouseEvent) => {
  e.preventDefault();
  formRef.value?.validate(
    async (errors: Array<FormValidationError> | undefined) => {
      if (!errors) {
        const success = await dataSources.createDataSource(formValue.value.url);
        if (success) {
          emit('close');
          formValue.value = { url: '' };
        }
      }
    },
  );
};
</script>
