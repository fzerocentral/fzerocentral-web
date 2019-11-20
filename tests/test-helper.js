import Application from '../app';
import config from '../config/environment';
import setupSinon from 'ember-sinon-qunit';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

setupSinon();

start();
