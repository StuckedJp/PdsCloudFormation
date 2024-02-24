import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AppStack } from './app-stack';

export interface AppStackProps extends cdk.StackProps {
  vpc: Vpc;
}

export class PdsAppStack extends cdk.Stack {
  public readonly app: AppStack;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    this.app = new AppStack(this, props.vpc);
  }
}
