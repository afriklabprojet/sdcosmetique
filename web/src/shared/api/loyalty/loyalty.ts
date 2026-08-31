/* eslint-disable @typescript-eslint/no-namespace */
import { Customer } from './customer';
import { Admin as AdminNamespace } from './admin';
import { Config as ConfigNamespace } from './config';
import { Metric as MetricNamespace } from './metric';

export namespace Loyalty {
  export const read = Customer.read;
  export const redeem = Customer.redeem;

  export import Admin = AdminNamespace;
  export import Config = ConfigNamespace;
  export import Metric = MetricNamespace;
}
