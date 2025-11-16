module.exports = {
  changelogFilename: 'CHANGELOG.md',
  dataSource: 'milestones',
  groupBy: {
    Enhancements: ['feature'],
    Fixes: ['bug'],
    Maintenance: ['task'],
    Uncategorised: ['closed'],
  },
  ignoreLabels: ['asciidoc', 'blocked', 'browser', 'device', 'helpwanted', 'hugo', 'idea', 'mermaid', 'needsfeedback', 'undecided'],
  ignoreIssuesWith: ['discussion', 'documentation', 'duplicate', 'invalid', 'support', 'unresolved', 'update', 'wontchange'],
  ignoreTagsWith: ['Relearn', 'x'],
  milestoneMatch: '{{tag_name}}',
  onlyMilestones: true,
  template: {
    changelogTitle: '',
    group: '\n### {{heading}}\n',
    release: ({ body, date, release }) => `## ${release} (` + date.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1') + `)\n${body}`,
  },
};
