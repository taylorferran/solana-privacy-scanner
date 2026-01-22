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

  ciToolsSidebar: [
    'ci-tools/overview',
    'ci-tools/example',
    'ci-tools/testing',
    'ci-tools/github-actions',
    'ci-tools/for-llms',
  ],

  codeAnalyzerSidebar: [
    'code-analyzer/overview',
    'code-analyzer/installation',
    'code-analyzer/ci-cd',
    'code-analyzer/cli-reference',
  ],

  claudePluginSidebar: [
    'claude-plugin/overview',
    'claude-plugin/installation',
    'claude-plugin/usage',
    'claude-plugin/examples',
  ],
};

export default sidebars;
