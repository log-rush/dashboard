<template>
  <n-modal :show="isOpen">
    <n-card
      style="max-width: 600px"
      title="Register DataSource"
      :bordered="false"
      size="huge"
      role="dialog"
    >
      <n-form
        :model="formValue"
        :rules="rules"
        size="medium"
        ref="formRef"
        @keyup.prevent.esc="emit('close')"
      >
        <n-form-item
          label="Url"
          path="url"
          :validation-status="status"
          :feedback="feedback"
        >
          <n-input
            v-model:value="formValue.url"
            placeholder="Service Url"
            @keyup.prevent.enter="createDataSource"
            clearable
          />
        </n-form-item>
      </n-form>
      <template v-if="cantFindDataSource">
        <n-alert title="Can't create DataSource" type="error">
          Can't find the DataSource. (HTTP Request returned an invalid response)
        </n-alert>
      </template>
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
import { useDataSources } from '@/core/stores/root';
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
  NAlert,
  useMessage,
} from 'naive-ui';
import { defineProps, defineEmits, ref, watch, computed } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const FullRegex =
  /^http(s?):\/\/(localhost|(\d{1,3}\.){3}\d{1,3}|(.*\.)?(.*)\.(.*))(:\d{1,5})?\/$/;
const NearRegex =
  /^http(s?):\/\/(localhost|(\d{1,3}\.){3}\d{1,3}|(.*\.)?(.*)\.(.*))(:\d{1,5})?$/;

const message = useMessage();
const dataSources = useDataSources();
const formRef = ref<FormInst | null>(null);
const createDisabled = ref(false);
const cantFindDataSource = ref(false);
const formValue = ref({
  url: '',
});

const status = computed(() => {
  if (FullRegex.test(formValue.value.url)) {
    return undefined;
  } else if (NearRegex.test(formValue.value.url)) {
    return 'warning';
  } else {
    return 'error';
  }
});

const feedback = computed(() => {
  if (FullRegex.test(formValue.value.url)) {
    return undefined;
  } else if (NearRegex.test(formValue.value.url)) {
    return "Nearly done, just add a trailing '/'";
  } else {
    return 'The url should follow the schema http(s?)://<your-domain>/';
  }
});
const rules: FormRules = {
  url: {
    required: true,
    trigger: ['input', 'blur'],
    validator: (_rule: FormItemRule, value: string) => {
      if (!value) {
        return new Error('The url is required');
      } else if (!FullRegex.test(value)) {
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
  cantFindDataSource.value = false;
  formRef.value?.validate(
    async (errors: Array<FormValidationError> | undefined) => {
      if (!errors) {
        const success = await dataSources.createDataSource(formValue.value.url);
        if (success) {
          emit('close');
          message.success(`Created DataSource ${formValue.value.url}`);
          formValue.value = { url: '' };
        } else {
          cantFindDataSource.value = true;
        }
      }
    },
  );
};
</script>
