import { aws_ec2 } from 'aws-cdk-lib';
import { NatInstanceProvider, SubnetType, GatewayVpcEndpointAwsService } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Ipv6Subnet } from './ipv6-subnet';

export class VpcStack extends Construct {
  public readonly vpc: aws_ec2.Vpc;

  constructor(scope: Construct) {
    super(scope, 'vpc');

    const vpc = new aws_ec2.Vpc(this, 'pds-infra-vpc', {
      ipAddresses: aws_ec2.IpAddresses.cidr(process.env.VPC_CIDR!),
      vpcName: 'pds-infra-vpc',
      maxAzs: 2,
      subnetConfiguration: [
        {
          subnetType: SubnetType.PUBLIC,
          name: 'Ingress',
          cidrMask: 24,
        },
        {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          name: 'Application',
          cidrMask: 24,
        },
      ],
      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
        },
      },
    });

    // IPv6
    new Ipv6Subnet(this, 'pds-infra-vpc-ipv6', { vpc });

    this.vpc = vpc;
  }
}
