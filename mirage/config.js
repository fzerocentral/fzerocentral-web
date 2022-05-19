import { discoverEmberDataModels, Response } from 'ember-cli-mirage';
import { createServer } from 'miragejs';

export default function (config) {
  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    routes,
  };

  return createServer(finalConfig);
}

function routes() {
  this.namespace = '/';

  this.get('/charts', (schema /* request */) => {
    return schema.charts.all();
  });

  this.get('/charts/:id', (schema, request) => {
    return schema.charts.find(request.params.id);
  });

  this.get('/charts/:id/other_records', (/* schema, request */) => {
    return [];
  });
  this.get('/charts/:id/ranking', (/* schema, request */) => {
    return [];
  });
  this.get('/charts/:id/record_history', (/* schema, request */) => {
    return [];
  });
  this.get(
    '/charts/:chart_id/players/:player_id/history',
    (/* schema, request */) => {
      return [];
    }
  );

  this.get('/chart_groups', (schema, request) => {
    let chartGroups = schema.chartGroups.all();

    if (request.queryParams.game_id) {
      chartGroups = chartGroups.filter(
        (chartGroup) => chartGroup.gameId === request.queryParams.game_id
      );
    }

    return chartGroups;
  });

  this.get('/chart_groups/:id', (schema, request) => {
    return schema.chartGroups.find(request.params.id);
  });

  this.get('/chart_tags', (schema /* request */) => {
    return schema.chartTags.all();
  });

  this.get('/chart_types', (schema, request) => {
    let chartTypes = schema.chartTypes.all();

    if (Object.prototype.hasOwnProperty.call(request.queryParams, 'game_id')) {
      chartTypes = chartTypes.filter(
        (chartType) => chartType.gameId === request.queryParams.game_id
      );
    }

    return chartTypes;
  });

  this.get('/chart_types/:id', (schema, request) => {
    return schema.chartTypes.find(request.params.id);
  });

  this.get('/filter_groups', (schema, request) => {
    if (Object.prototype.hasOwnProperty.call(request.queryParams, 'game_id')) {
      // FGs of a particular game
      return schema.filterGroups.where({ gameId: request.queryParams.game_id });
    } else {
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
      name: name,
      kind: kind,
      description: description,
      showByDefault: showByDefault,
    });
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
    if (
      Object.prototype.hasOwnProperty.call(
        request.queryParams,
        'filter_group_id'
      )
    ) {
      // FILs of a particular FG
      let allLinks = schema.filterImplicationLinks.all();
      links = schema.filterImplicationLinks.none();
      allLinks.models.forEach((link) => {
        let filterGroupId = link.implyingFilter.filterGroup.id;
        if (filterGroupId === request.queryParams.filter_group_id) {
          links.add(link);
        }
      });
    } else {
      // All objects
      links = schema.filterImplicationLinks.all();
    }

    // Partial implementation of pagination. The results aren't actually
    // paginated, but the Per-Page and Total headers are given.
    return new Response(200, { 'Per-Page': 20, Total: links.length }, links);
  });

  this.post('/filter_implication_links', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let implyingFilterId = data.relationships['implying-filter'].data.id;
    let impliedFilterId = data.relationships['implied-filter'].data.id;
    let link = schema.filterImplicationLinks.create({
      implyingFilterId: implyingFilterId,
      impliedFilterId: impliedFilterId,
    });
    return link;
  });

  this.delete('/filter_implication_links/:id', (schema, request) => {
    let link = schema.filterImplicationLinks.find(request.params.id);
    link.destroy();
  });

  this.get('/filter_implications', (schema, request) => {
    if (
      Object.prototype.hasOwnProperty.call(
        request.queryParams,
        'implying_filter_id'
      )
    ) {
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
    } else {
      // All objects
      return schema.filterImplications.all();
    }
  });

  this.get('/filters', (schema, request) => {
    let filters = schema.filters.all();

    if (request.queryParams.filter_group_id) {
      filters = filters.filter(
        (f) => f.filterGroup.id === request.queryParams.filter_group_id
      );
    }
    if (request.queryParams.usage_type) {
      filters = filters.filter(
        (f) => f.usageType === request.queryParams.usage_type
      );
    }
    if (request.queryParams.name_search) {
      // Filters which have the name_search value as a substring of their name
      filters = filters.filter(
        (f) =>
          f.name
            .toLowerCase()
            .indexOf(request.queryParams.name_search.toLowerCase()) !== -1
      );
    }
    if (request.queryParams.implied_by_filter_id) {
      // Filters which have the specified filter id in its incoming implications
      let implied_by_filter = schema.filters.find(
        request.queryParams.implied_by_filter_id
      );
      filters = filters.filter((f) =>
        f.incomingFilterImplications.includes(implied_by_filter)
      );
    }
    if (request.queryParams.implies_filter_id) {
      // Filters which have the specified filter id in its outgoing implications
      let implies_filter = schema.filters.find(
        request.queryParams.implies_filter_id
      );
      filters = filters.filter((f) =>
        f.outgoingFilterImplications.includes(implies_filter)
      );
    }

    // Sort by filter name, ascending
    filters = filters.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return filters;
  });

  this.post('/filters', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let args = {};

    args.name = data.attributes.name;
    args.filterGroupId = data.relationships['filter-group'].data.id;

    if (Object.prototype.hasOwnProperty.call(data.attributes, 'usage-type')) {
      args.usageType = data.attributes['usage-type'];
    } else {
      args.usageType = 'choosable';
    }
    if (
      Object.prototype.hasOwnProperty.call(data.attributes, 'numeric-value')
    ) {
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
    if (
      Object.prototype.hasOwnProperty.call(data.attributes, 'numeric-value')
    ) {
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

  this.post(
    '/filters/:id/relationships/outgoing_filter_implications',
    (schema, request) => {
      let requestJSON = JSON.parse(request.requestBody);
      let filter = schema.filters.find(request.params.id);
      let implications = filter.outgoingFilterImplications;
      requestJSON.data.forEach((f) => {
        implications.add(schema.filters.find(f.id));
      });
      filter.update('outgoingFilterImplications', implications);
      return filter;
    }
  );

  this.delete(
    '/filters/:id/relationships/outgoing_filter_implications',
    (schema, request) => {
      let requestJSON = JSON.parse(request.requestBody);
      let filter = schema.filters.find(request.params.id);
      let implications = filter.outgoingFilterImplications;
      requestJSON.data.forEach((f) => {
        implications.remove(schema.filters.find(f.id));
      });
      filter.update('outgoingFilterImplications', implications);
      return filter;
    }
  );

  this.get('/games', (schema) => {
    return schema.games.all();
  });

  this.get('/games/:id', (schema, request) => {
    return schema.games.find(request.params.id);
  });

  this.get('/ladders', (schema, request) => {
    let ladders = schema.ladders.all();

    if (request.queryParams.game_id) {
      ladders = ladders.filter(
        (ladder) => ladder.gameId === request.queryParams.game_id
      );
    }
    if (request.queryParams.kind) {
      ladders = ladders.filter(
        (ladder) => ladder.kind === request.queryParams.kind
      );
    }

    return ladders;
  });

  this.post('/ladders', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;

    return schema.ladders.create({
      name: data.attributes.name,
      kind: data.attributes.kind,
      filterSpec: data.attributes['filter-spec'],
      orderInGameAndKind: data.attributes['order-in-game-and-kind'],
      chartGroup: schema.chartGroups.find(
        data.relationships['chart-group'].data.id
      ),
      game: schema.games.find(data.relationships.game.data.id),
    });
  });

  this.get('/ladders/:id', (schema, request) => {
    return schema.ladders.find(request.params.id);
  });

  this.patch('/ladders/:id', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;

    // Accept updates to all besides game and kind
    let args = {};
    if (Object.prototype.hasOwnProperty.call(data.attributes, 'name')) {
      args['name'] = data.attributes['name'];
    }
    if (Object.prototype.hasOwnProperty.call(data.attributes, 'filter-spec')) {
      args['filterSpec'] = data.attributes['filter-spec'];
    }
    if (
      Object.prototype.hasOwnProperty.call(
        data.attributes,
        'order-in-game-and-kind'
      )
    ) {
      args['orderInGameAndKind'] = data.attributes['order-in-game-and-kind'];
    }
    if (data.relationships['chart-group'].data) {
      args['chartGroup'] = schema.chartGroups.find(
        data.relationships['chart-group'].data.id
      );
    }

    let ladder = schema.ladders.find(request.params.id);
    ladder.update(args);
    return ladder;
  });

  this.delete('/ladders/:id', (schema, request) => {
    let ladder = schema.ladders.find(request.params.id);
    ladder.destroy();
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
          sortFunc = (a, b) => {
            return a.value - b.value;
          };
        } else {
          sortFunc = (a, b) => {
            return b.value - a.value;
          };
        }
      } else if (sortMethod === 'date_achieved') {
        // Latest date first
        sortFunc = (a, b) => {
          return b.dateAchieved - a.dateAchieved;
        };
      }
      records = records.sort(sortFunc);

      // Really naive way of adding ranks. In reality, should be taking
      // ranked_entity param into account, as well as accounting for ties.
      records.models.forEach((record, index) => {
        record.attrs.rank = index + 1;
      });
    } else {
      records = schema.records.all();
    }

    records.models.forEach((record) => {
      // We'll implement a very limited number of format specs so we can
      // at least test when valueDisplay differs from value.
      let formatSpec = record.chart.chartType.format_spec;
      if (formatSpec === '[{"suffix": "m"}]') {
        record.attrs.valueDisplay = record.attrs.value + 'm';
      } else {
        record.attrs.valueDisplay = record.attrs.value;
      }
    });

    return records;
  });

  this.post('/records', (schema, request) => {
    let requestJSON = JSON.parse(request.requestBody);
    let data = requestJSON.data;
    let value = data.attributes.value;
    let dateAchieved = data.attributes['date-achieved'];
    let chart = schema.charts.find(data.relationships.chart.data.id);
    let player = schema.players.find(data.relationships.player.data.id);
    let record = schema.records.create({
      value: value,
      dateAchieved: dateAchieved,
      chart: chart,
      player: player,
    });
    return record;
  });

  this.get('/records/:id', (schema, request) => {
    return schema.records.find(request.params.id);
  });

  this.get('/players', (schema) => {
    return schema.players.all();
  });

  this.get('/players/:id', (schema, request) => {
    return schema.players.find(request.params.id);
  });
}
