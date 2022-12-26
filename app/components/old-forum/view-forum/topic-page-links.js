import Component from '@glimmer/component';

export default class OldForumViewForumTopicPageLinksComponent extends Component {
  get hasEllipsis() {
    return this.args.topic.pageCount > 4;
  }

  get pageNumbers() {
    let pageNumbers = [1];
    let pageCount = this.args.topic.pageCount;
    for (let n = pageCount - 2; n <= pageCount; n++) {
      if (n >= 2) {
        pageNumbers.push(n);
      }
    }
    return pageNumbers;
  }
}
