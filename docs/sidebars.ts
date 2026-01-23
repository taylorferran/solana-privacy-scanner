import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  spsSidebar: [
    {
      type: 'category',
      label: 'SPS',
      items: [
        'sps/what-is-this',
        'sps/concepts',
        'sps/quicknode',
      ],
    },
    {
      type: 'category',
      label: 'Understanding Reports',
      items: [
        'reports/risk-levels',
        'reports/heuristics',
        'reports/known-entities',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/custom-heuristics',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/addresses',
        'contributing/development',
      ],
    },
  ],

  coreSidebar: [
    'core/usage',
    'core/api-reference',
    'core/for-llms',
  ],

  toolkitSidebar: [
    'toolkit/overview',
    'toolkit/commands',
    'toolkit/for-llms',
  ],

  claudePluginSidebar: [
    'claude-plugin/guide',
  ],
};

export default sidebars;
