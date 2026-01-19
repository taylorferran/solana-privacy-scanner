import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guideSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: [
        'guide/what-is-this',
        'guide/getting-started',
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
      label: 'Contributing',
      items: [
        'contributing/addresses',
        'contributing/development',
      ],
    },
    {
      type: 'category',
      label: 'Project',
      items: [
        'changelog',
      ],
    },
  ],
  
  librarySidebar: [
    {
      type: 'category',
      label: 'Library',
      items: [
        'library/usage',
        'library/examples',
        'library/for-llms',
      ],
    },
  ],
  
  cliSidebar: [
    {
      type: 'category',
      label: 'CLI',
      items: [
        'cli/quickstart',
        'cli/user-guide',
        'cli/examples',
        'cli/for-llms',
      ],
    },
  ],
  
  ciToolsSidebar: [
    {
      type: 'category',
      label: 'CI/CD Tools',
      items: [
        'ci-tools/overview',
        'ci-tools/testing',
        'ci-tools/github-actions',
        'ci-tools/for-llms',
      ],
    },
  ],
};

export default sidebars;
