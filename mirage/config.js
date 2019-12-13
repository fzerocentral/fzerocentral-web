import { Response } from 'ember-cli-mirage';

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

  this.get('/charts/:id', (schema, request) => {
    return schema.charts.find(request.params.id);
  });

  this.get('/chart_groups/:id', (schema, request) => {
    return schema.chartGroups.find(request.params.id);
  });

  this.get('/chart_types', (schema, request) => {
    if (request.queryParams.hasOwnProperty('filter_group_id')) {
      let filterGroup = schema.filterGroups.find(
        request.queryParams.filter_group_id);
      let ctfgs = schema.chartTypeFilterGroups.where(
        {filterGroupId: filterGroup.id});
      let chartTypes = schema.chartTypes.none();
      ctfgs.models.forEach((ctfg) => {
        chartTypes.add(schema.chartTypes.find(ctfg.chartTypeId));
      });
      return chartTypes;
    }
    else {
      return schema.chartTypes.all();
    }
  });

  this.get('/chart_types/:id', (schema, request) => {
    return schema.chartTypes.find(request.params.id);
  });

  this.get('/chart_type_filter_groups', (schema, request) => {
    if (request.queryParams.hasOwnProperty('chart_type_id')) {
      let chartType = schema.chartTypes.find(
        request.queryParams.chart_type_id);
      return schema.chartTypeFilterGroups.where({chartTypeId: chartType.id});
    }
    else {
      return schema.chartTypeFilterGroups.all();
    }
  });

  this.post('/chart_type_filter_groups', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let order = 1;
    if (data.attributes.hasOwnProperty('order-in-chart-type')) {
      order = data.attributes['order-in-chart-type'];
    }
    let showByDefault = false;
    if (data.attributes.hasOwnProperty('show-by-default')) {
      showByDefault = data.attributes['show-by-default'];
    }
    let chartTypeId = data.relationships['chart-type'].data.id;
    let filterGroupId = data.relationships['filter-group'].data.id;
    let ctfg = schema.chartTypeFilterGroups.create({
      chartTypeId: chartTypeId, filterGroupId: filterGroupId,
      orderInChartType: order, showByDefault: showByDefault});
    return ctfg;
  });

  this.patch('/chart_type_filter_groups/:id', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let ctfg = schema.chartTypeFilterGroups.find(request.params.id);
    let args = {};
    if (data.attributes.hasOwnProperty('order-in-chart-type')) {
      args.orderInChartType = data.attributes['order-in-chart-type'];
    }
    if (data.attributes.hasOwnProperty('show-by-default')) {
      args.showByDefault = data.attributes['show-by-default'];
    }
    ctfg.update(args);
    return ctfg;
  });

  this.delete('/chart_type_filter_groups/:id', (schema, request) => {
    let ctfg = schema.chartTypeFilterGroups.find(request.params.id);
    ctfg.destroy();
  });

  this.get('/filter_groups', (schema, request) => {
    if (request.queryParams.hasOwnProperty('chart_type_id')) {
      if (request.queryParams.chart_type_id === '') {
        // FGs without a CT. We'll implement this very naively, so don't give
        // Mirage too many FGs in this case...
        let filterGroups = schema.filterGroups.none();
        schema.filterGroups.all().models.forEach((filterGroup) => {
          if (schema.chartTypeFilterGroups.where({
              filterGroupId: filterGroup.id}).length === 0) {
            filterGroups.add(filterGroup);
          }
        });

        return filterGroups;
      }
      else {
        // FGs of a particular CT
        let chartType = schema.chartTypes.find(
          request.queryParams.chart_type_id);
        let ctfgs = schema.chartTypeFilterGroups.where(
          {chartTypeId: chartType.id});
        let filterGroups = schema.filterGroups.none();
        ctfgs.models.forEach((ctfg) => {
          filterGroups.add(schema.filterGroups.find(ctfg.filterGroupId));
        });
        return filterGroups;
      }
    }
    else if (request.queryParams.hasOwnProperty('game_id')) {
      // FGs of a particular game
      let chartTypes = schema.chartTypes.where(
        {gameId: request.queryParams.game_id});
      let filterGroups = schema.filterGroups.none();
      let seenFilterGroupIds = new Set();
      chartTypes.models.forEach((chartType) => {
        let ctfgs = schema.chartTypeFilterGroups.where(
          {chartTypeId: chartType.id});
        ctfgs.models.forEach((ctfg) => {
          let filterGroup = schema.filterGroups.find(ctfg.filterGroupId);
          if (seenFilterGroupIds.has(filterGroup.id)) {
            return;
          }
          filterGroups.add(filterGroup);
          seenFilterGroupIds.add(filterGroup.id);
        });
      });
      return filterGroups;
    }
    else {
      // All FGs
      return schema.filterGroups.all();
    }
  });

  this.post('/filter_groups', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let name = data.attributes.name;
    let kind = data.attributes.kind;
    let description = data.attributes.description;
    let showByDefault = data.attributes.showByDefault || false;
    return schema.filterGroups.create({
      name: name, kind: kind,
      description: description, showByDefault: showByDefault});
  });

  this.get('/filter_groups/:id', (schema, request) => {
    return schema.filterGroups.find(request.params.id);
  });

  this.delete('/filter_groups/:id', (schema, request) => {
    let filterGroup = schema.filterGroups.find(request.params.id);
    filterGroup.destroy();
  });

  this.get('/filter_implication_links', (schema, request) => {
    let links = null;
    if (request.queryParams.hasOwnProperty('filter_group_id')) {
      // FILs of a particular FG
      let allLinks = schema.filterImplicationLinks.all();
      links = schema.filterImplicationLinks.none();
      allLinks.models.forEach((link) => {
        let filterGroupId = link.implyingFilter.filterGroup.id;
        if (filterGroupId === request.queryParams.filter_group_id) {
          links.add(link);
        }
      });
    }
    else {
      // All objects
      links = schema.filterImplicationLinks.all();
    }

    // Partial implementation of pagination. The results aren't actually
    // paginated, but the Per-Page and Total headers are given.
    return new Response(
      200, {'Per-Page': 20, 'Total': links.length}, links);
  });

  this.post('/filter_implication_links', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let implyingFilterId = data.relationships['implying-filter'].data.id;
    let impliedFilterId = data.relationships['implied-filter'].data.id;
    let link = schema.filterImplicationLinks.create({
      implyingFilterId: implyingFilterId, impliedFilterId: impliedFilterId});
    return link;
  });

  this.delete('/filter_implication_links/:id', (schema, request) => {
    let link = schema.filterImplicationLinks.find(request.params.id);
    link.destroy();
  });

  this.get('/filter_implications', (schema, request) => {
    if (request.queryParams.hasOwnProperty('implying_filter_id')) {
      // FILs of a particular FG
      let allImplications = schema.filterImplications.all();
      let implications = schema.filterImplications.none();
      allImplications.models.forEach((implication) => {
        let implyingId = implication.implyingFilter.id;
        if (implyingId === request.queryParams.implying_filter_id) {
          implications.add(implication);
        }
      });
      return implications;
    }
    else {
      // All objects
      return schema.filterImplications.all();
    }
  });

  this.get('/filters', (schema, request) => {
    let filters = schema.filters.all();

    if (request.queryParams.filter_group_id) {
      filters = filters.filter(
        f => f.filterGroup.id === request.queryParams.filter_group_id);
    }
    if (request.queryParams.usage_type) {
      filters = filters.filter(
        f => f.usageType === request.queryParams.usage_type);
    }

    // Sort by filter name, ascending
    filters = filters.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    // Partial implementation of pagination. The results aren't actually
    // paginated, but the Per-Page and Total headers are given.
    return new Response(
      200, {'Per-Page': 20, 'Total': filters.length}, filters);
  });

  this.post('/filters', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let args = {};

    args.name = data.attributes.name;
    args.filterGroupId = data.relationships['filter-group'].data.id;

    if (data.attributes.hasOwnProperty('usage-type')) {
      args.usageType = data.attributes['usage-type'];
    }
    else {
      args.usageType = 'choosable';
    }
    if (data.attributes.hasOwnProperty('numeric-value')) {
      args.numericValue = data.attributes['numeric-value'];
    }

    let filter = schema.filters.create(args);
    return filter;
  });

  this.patch('/filters/:id', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let args = {};
    args.name = data.attributes.name;
    if (data.attributes.hasOwnProperty('numeric-value')) {
      args.numericValue = data.attributes['numeric-value'];
    }
    let filter = schema.filters.find(request.params.id);
    filter.update(args);
    return filter;
  });

  this.delete('/filters/:id', (schema, request) => {
    let filter = schema.filters.find(request.params.id);
    filter.destroy();
  });

  this.get('/filters/:id', (schema, request) => {
    return schema.filters.find(request.params.id);
  });

  this.get('/games', (schema, request) => {
    if (request.queryParams.chart_type_id) {
      // Return a single game
      let chartType = schema.chartTypes.find(request.queryParams.chart_type_id);
      return chartType.game;
    }
    else {
      return schema.games.all();
    }
  });

  this.get('/records', (schema, request) => {
    let records = null;

    if (request.queryParams.chart_id) {
      let chart = schema.charts.find(request.queryParams.chart_id);
      records = chart.records;

      // Handle sort params
      let sortMethod = request.queryParams.sort || 'value';
      let sortFunc = null;

      // Negative return value = sort a first, positive = sort b first
      if (sortMethod === 'value') {
        let orderAscending = chart.chartType.order_ascending;

        if (orderAscending === true) {
          sortFunc = ((a, b) => { return a.value - b.value; });
        }
        else {
          sortFunc = ((a, b) => { return b.value - a.value; });
        }
      }
      else if (sortMethod === 'date_achieved') {
        // Latest date first
        sortFunc = ((a, b) => { return b.achievedAt - a.achievedAt; });
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
      // We'll implement a very limited number of format specs so we can
      // at least test when valueDisplay differs from value.
      let formatSpec = record.chart.chartType.format_spec;
      if (formatSpec === '[{"suffix": "m"}]') {
        record.attrs.valueDisplay = record.attrs.value + 'm';
      }
      else {
        record.attrs.valueDisplay = record.attrs.value;
      }
    });

    return new Response(
      200, {'Per-Page': 1000, 'Total': records.length}, records);
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
