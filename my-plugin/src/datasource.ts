import defaults from 'lodash/defaults';

import {
  getBackendSrv
  } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  loginsighturl string;
  

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.loginsighturl = instanceSettings.url!;
  }
  
  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map((query) =>
      this.doRequest(query).then((response) => {
        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: "Time", type: FieldType.time },
            { name: "Value", type: FieldType.number },
          ],
        });

        response.data.forEach((point: any) => {
          frame.appendRow([point.time, point.value]);
        });

        return frame;
      })
    );

  return Promise.all(promises).then((data) => ({ data }));
}


  async testDatasource() {
    // Implement a health check for your data source.
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });    
  }

  
  async doRequest(query: MyQuery) {
    const result = await getBackendSrv().datasourceRequest({
      method: "GET",
      url: "https://api.example.com/metrics",
      params: query,
    })

    return result;
  }


}


https://github.com/8451/loginsight-grafana-datasource/blob/master/src/datasource.js
