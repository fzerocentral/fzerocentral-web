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

  this.get('/records', (schema, request) => {
    let chart = schema.charts.find(request.queryParams.chart_id);
    let sortFunc = null;
    if (chart.chartType.order_ascending === true) {
      sortFunc = ((a, b) => { return b.value < a.value; });
    }
    else {
      sortFunc = ((a, b) => { return a.value < b.value; });
    }
    let records = chart.records.sort(sortFunc);
    
    records.models.forEach((record, index) => {
      record.attrs.rank = index + 1;
      // Can't be bothered to implement value_display properly in JS, and it
      // doesn't seem to matter for testing purposes anyway
      record.attrs.value_display = record.attrs.value;
    });
    return records;
  });

  this.get('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id);
  });
}
