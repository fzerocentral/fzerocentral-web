export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
   */

  this.namespace = '/';

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');
  */

  this.get('/chart_groups/:id', (schema, request) => {
    return schema.chartGroups.find(request.params.id);
  });

  this.get('/charts/:id', (schema, request) => {
    return schema.charts.find(request.params.id);
  });

  this.get('/filter_groups', (schema) => {
    return schema.filterGroups.all();
  });

  this.get('/filter_groups/:id', (schema, request) => {
    return schema.filterGroups.find(request.params.id);
  });

  this.get('/filters', (schema, request) => {
    let filters = null;
    if (request.queryParams.filter_group_id) {
      let filterGroup = schema.filterGroups.find(
        request.queryParams.filter_group_id);
      filters = filterGroup.filters;
    }
    else {
      filters = schema.filters.all();
    }

    return filters;
  });

  this.get('/records', (schema, request) => {
    let records = null;

    if (request.queryParams.chart_id) {
      let chart = schema.charts.find(request.queryParams.chart_id);
      records = chart.records;

      // Handle sort params
      let orderAscending = chart.chartType.order_ascending;
      let sortMethod = request.queryParams.sort || 'value';
      let sortFunc = null;
      if (sortMethod === 'value') {
        if (orderAscending === true) {
          sortFunc = ((a, b) => { return b.value < a.value; });
        }
        else {
          sortFunc = ((a, b) => { return a.value < b.value; });
        }
      }
      else if (sortMethod === 'date_achieved') {
        if (orderAscending === true) {
          sortFunc = ((a, b) => { return b.achievedAt < a.achievedAt; });
        }
        else {
          sortFunc = ((a, b) => { return a.achievedAt < b.achievedAt; });
        }
      }
      records = records.sort(sortFunc);

      // Really naive way of adding ranks. In reality, should be taking
      // ranked_entity param into account, as well as accounting for ties.
      records.models.forEach((record, index) => {
        record.attrs.rank = index + 1;
      });
    }
    else {
      records = schema.records.all();
    }

    records.models.forEach((record) => {
      // Can't be bothered to implement valueDisplay properly in JS (e.g.
      // 1'23"456, not 123456), and it doesn't seem to matter for our testing
      // purposes anyway
      record.attrs.valueDisplay = record.attrs.value;
    });

    return records;
  });

  this.post('/records', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let value = data.attributes.value;
    let achievedAt = data.attributes['achieved-at'];
    let chart = schema.charts.find(data.relationships.chart.data.id);
    let user = schema.users.find(data.relationships.user.data.id);
    let record = schema.records.create({
      value: value, achievedAt: achievedAt, chart: chart, user: user});
    return record;
  });

  this.get('/records/:id', (schema, request) => {
    return schema.records.find(request.params.id);
  });

  this.get('/users', (schema) => {
    return schema.users.all();
  });

  this.get('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id);
  });
}
