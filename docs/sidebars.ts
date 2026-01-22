import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guideSidebar: [
    {
      type: 'category',
      label: 'Guide',
      items: [
        'guide/what-is-this',
        'guide/concepts',
        'guide/quicknode',
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
  
  librarySidebar: [
    'library/usage',
    'library/api-reference',
    'library/examples',
    'library/for-llms',
  ],

  cliSidebar: [
    'cli/guide',
    'cli/for-llms',
  ],

  devtoolsSidebar: [
    'devtools/guide',
    'devtools/for-llms',
  ],

  claudePluginSidebar: [
    'claude-plugin/guide',
  ],
};

export default sidebars;
