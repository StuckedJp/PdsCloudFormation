import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';

export class PdsInfraStack extends cdk.Stack {
  public readonly vpc: VpcStack;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new VpcStack(this);
  }
}
