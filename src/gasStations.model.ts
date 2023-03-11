import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Table } from "dynamodb-onetable";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new Dynamo({ client: new DynamoDBClient({ region: "eu-west-1" }) });
import Schema from './schema'
import retrieveSecrets from "./utils/retrieveSecrets";


export class GasStations {
  Crypto: any;
  table: Table;
  User: any;
  Project: any;
  Account: any;
  Order: any;
  GasStation: any;
  Payment: any;
  Kyt: any;
  secretsString: any;

  private constructor(secretsString: any) {

    this.secretsString = secretsString

    this.Crypto = {
      primary: {
        cipher: "aes-256-gcm",
        password: this.secretsString.CryptoPrimaryPassword,
      },
    };

    this.table = new Table({
      client: client,
      schema: Schema,
      partial: false,
      crypto: this.Crypto,
      name: process.env.TABLE_CRYPTOPAY_ACCOUNTS,
      /*logger: (level, message, context) => {
        console.log(`${new Date().toLocaleString()}: ${level}: ${message}`)
        console.log(JSON.stringify(context, null, 4) + '\n')
    }*/
    });

    this.User = this.table.getModel("User");
    this.Project = this.table.getModel("Project");
    this.Account = this.table.getModel("Account");
    this.Order = this.table.getModel("Order");
    this.Payment = this.table.getModel("Payment");
    this.Kyt = this.table.getModel("Kyt");
    this.GasStation = this.table.getModel("GasStation");

  }



  static init = async () => {
    const secretsString = await retrieveSecrets("/coinhouse-solution/CardPayment-configuration")
    return new GasStations(secretsString)
  }


  insert = async (gasStation: any, projectId: String) => {
    try {
      const project = await this.Project.get({ id: projectId }, { index: "gs2", follow: true })
      if (Object.keys(project).length > 0) {
        if(project.typeProject !== "gasStation") throw new Error('That project is not configured for type gasStation. Please choose another one, create a new one or chnage this one for this kind of project. Be careful, if you change the project type, all your other instance could be impacted')

        this.table.setContext({ accountId: project.accountId });
        gasStation.accountId = project.accountId;
        gasStation.codeProject = project.codeProject;
        gasStation.projectId= project.id;

        if(!project.parameters.gasStation.currency || !project.parameters.gasStation.limitPer24H) throw new Error('That project is not fine configured. Please update your project with paramaeters for project type gasStation')
        if(!gasStation.amount || gasStation.amount === 0) throw new Error('Amount propertie is incorrect. Please enter a value > 0')   
        if(! await this.isGasStationAvailable(project.accountId, project.id, gasStation.amount)) throw new Error('The daily purchase limit has been exceeded. Please change amount')

      } else {
        throw new Error(`Project not found! Please check your codeProject or API Key`);
      }
      return await this.GasStation.create(gasStation).then(async (gasStation: any) => {
        return gasStation;
      })
    } catch (error) {
      throw new Error(`Error during add new gasStation request ${error}`);
    }
  };

  isGasStationAvailable = async <Boolean>(accountId: string, projectId: string, amount: Number) => {
    try {
      const dateYeasterday: Date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
      const dateISOYesterday: String = new Date(dateYeasterday).toISOString()
      const listGasStationForToday:any = await this.list(accountId, projectId, {where : '${dateCreated} >= {'+dateISOYesterday+'}'})
      let sum: Number = amount
      listGasStationForToday.map((gas: any) => {
        sum = sum + gas.amount
      })
      const project = await this.Project.get({ id: projectId }, { index: "gs2", follow: true })
      const limit = project.parameters.gasStation.limitPer24H
      if (limit >= sum) return true
      else return false  
    } catch (e: any) {
      throw new Error(`Error during isGasStationAvailable: ${e.message}`);
    }
  };

  findById = async (id: string) => {
    return await this.GasStation.get({ id: id }, { index: "gs2", follow: true });
  };

  findPublicById = async (id: string) => {
    let order = await this.GasStation.get({ id: id }, { index: "gs2", follow: true });
    return order;
  };

  scan = async (params: any, query: any) => {
    return await this.GasStation.scan(params, query)
  }

  getById = async (id: string) => {
    return await this.GasStation.get({ id: id }, { index: "gs1", follow: true });
  };

  list = async (accountId: string, projectId: string, query: any) => {
    const key:Key = {}
    if (accountId) key.pk = `account#${accountId}`;
    if (projectId) key.projectId = projectId;
    return await this.GasStation.find(key, query);
  };

  patchById = async (id: string, data: any) => {
    try {
      let gasStation = await this.GasStation.get({ id: id }, { index: "gs1", follow: true });
      if (!gasStation) throw new Error(`no gasStation fund for id: ${id}`)
      this.table.setContext({ accountId: gasStation.accountId });
      data.id = id;
      return await this.GasStation.update(data);
    } catch (err) {
      throw new Error(`Error during update gasStation ${err}`);
    }
  };

  removeById = async (id: string) => {
    let gasStation = await this.GasStation.get({ id: id }, { index: "gs1", follow: true });
    if (!gasStation) throw new Error(`gasStation not found`);
    return await this.Order.remove({ sk: `gasStation#${id}`, pk: `account#${gasStation.accountId}` });
  };

}
export default GasStations


interface Key {
  [key: string]: any;
}

interface Params {
  [key: string]: any;
}