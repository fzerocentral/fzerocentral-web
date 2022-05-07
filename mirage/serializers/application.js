import { JSONAPISerializer, Serializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  // https://github.com/samselikoff/ember-cli-mirage/issues/1204
  alwaysIncludeLinkageData: true,

  serialize(object, request) {
    // This is how to call super, as Mirage borrows Backbone's implementation
    // of extend: http://backbonejs.org/#Model-extend
    let jsonPayload = Serializer.prototype.serialize.apply(this, arguments);

    if (jsonPayload.data.constructor === Array) {
      // Paginate the payload
      let pageNumber = request.queryParams['page[number]'] || 1;
      let perPage = request.queryParams['page[size]'] || 10;
      let count = jsonPayload.data.length;
      jsonPayload.meta = {
        pagination: {
          page: pageNumber,
          pages: Math.max(Math.ceil(count / perPage), 1),
          count: count,
        },
      };
      jsonPayload.data = jsonPayload.data.slice(
        perPage * (pageNumber - 1),
        perPage * pageNumber
      );
    }

    return jsonPayload;
  },
});
