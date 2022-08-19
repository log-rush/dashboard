<template>
  <n-modal :show="isOpen">
    <n-card
      style="max-width: 600px"
      title="Subscription Manager"
      :bordered="false"
      size="huge"
      role="dialog"
    >
      <n-tree
        block-line
        checkable
        :data="data"
        :checked-keys="checkedKeys"
        :on-load="handleLoad"
        :expanded-keys="expandedKeys"
        check-strategy="child"
        :allow-checking-not-loaded="true"
        :cascade="true"
        @update:checked-keys="handleCheckedKeysChange"
        @update:expanded-keys="handleExpandedKeysChange"
      />
      <template #footer>
        <n-space justify="end" size="small">
          <n-button secondary @click="emit('close')">Close</n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { useDataSources } from '@/core/adapter/dataSources';
import { useLogStreams } from '@/core/adapter/logStreams';
import { NModal, NCard, NSpace, NButton, NTree, TreeOption } from 'naive-ui';
import { defineProps, defineEmits, ref, watch } from 'vue';
import { arrayDiff } from '@/core/util/diff';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const dataSources = useDataSources();
const streams = useLogStreams();

const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const data = ref<TreeOption[]>([]);

const createStreamKey = (ds: string, stream: string) => `${ds}$::$${stream}`;
const streamKeyRegex = /.*\$::\$.*/;
const isStreamKey = (key: string) => streamKeyRegex.test(key);
const getStreamKey = (key: string) => key.split('$::$');

const createDsKey = (ds: string) => `__$${ds}`;
const isDsKey = (key: string) => key.startsWith('__$');
const getDsKey = (key: string) => key.substring(3);

watch(
  () => dataSources.allDataSources,
  (ds) => {
    data.value = ds.map((ds) => ({
      key: createDsKey(ds.id),
      label: ds.name,
      isLeaf: false,
      disabled: true,
    }));
  },
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      setup();
    } else {
      data.value = [];
    }
  },
);

const setup = () => {
  data.value = dataSources.allDataSources.map((ds) => ({
    key: createDsKey(ds.id),
    label: ds.name,
    isLeaf: false,
    disabled: true,
  }));
};

const handleLoad = async (node: TreeOption) => {
  // get key
  const key = node.key as string;
  if (!isDsKey(key)) {
    return;
  }
  const dsId = getDsKey(key);

  // fetch log streams
  const logStreams = await streams.getStreamsForDataSource(dsId);

  // update node
  node.disabled = false;
  node.children = logStreams.map((stream) => ({
    label: stream.alias,
    key: createStreamKey(dsId, stream.id),
    isLeaf: true,
  }));

  // check keys that are already subscribed
  checkedKeys.value = checkedKeys.value.concat(
    logStreams
      .filter((stream) => stream.isSubscribed)
      .map((stream) => createStreamKey(dsId, stream.id)),
  );
};

const handleExpandedKeysChange = (newExpandedKeys: string[]) => {
  expandedKeys.value = newExpandedKeys;
};

const handleCheckedKeysChange = (newCheckedKeys: string[]) => {
  const diff = arrayDiff(checkedKeys.value, newCheckedKeys);

  for (const id of diff.added) {
    if (isStreamKey(id)) {
      const [ds, stream] = getStreamKey(id);
      streams.subscribe(ds, stream);
    }
  }

  for (const id of diff.removed) {
    if (isStreamKey(id)) {
      const [ds, stream] = getStreamKey(id);
      streams.unsubscribe(ds, stream);
    }
  }

  checkedKeys.value = newCheckedKeys;
};
</script>
