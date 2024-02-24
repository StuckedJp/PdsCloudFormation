import {
  Vpc,
  SecurityGroup,
  Peer,
  Port,
  InstanceType,
  InstanceClass,
  InstanceSize,
  BlockDeviceVolume,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class AppStack extends Construct {
  constructor(scope: Construct, vpc: Vpc) {
    super(scope, 'app');

    // SecurityGroup
    const securityGroup = new SecurityGroup(this, 'pds-app-security-group', {
      vpc,
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,
    });
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    securityGroup.addIngressRule(Peer.anyIpv6(), Port.tcp(22));
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
    securityGroup.addIngressRule(Peer.anyIpv6(), Port.tcp(80));
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443));
    securityGroup.addIngressRule(Peer.anyIpv6(), Port.tcp(443));

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      `apt-get update`,
      `apt-get upgrade -y`,
      // AWS CLI
      `cd /root`,
      `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`,
      `unzip awscliv2.zip`,
      `./aws/install`,
    );
    // https://cloud-images.ubuntu.com/locator/ec2/
    const machineImage = ec2.MachineImage.genericLinux(
      {
        'us-east-1': 'ami-0cf1810907a781f00',
      },
      {
        userData,
      },
    );

    // App
    const appInstance = new ec2.Instance(this, 'pds-app-instance', {
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'pds-app-instance-key-pair', process.env.BASTON_KEY_PAIR_NAME!),
      vpc,
      machineImage,
      securityGroup,
      vpcSubnets: vpc.selectSubnets({ subnetType: SubnetType.PUBLIC }),
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: BlockDeviceVolume.ebs(Number(process.env.PDS_STORAGE_GB)),
        },
      ],
    });

    // EIP
    new ec2.CfnEIP(this, 'pds-app-instance-eip', {
      instanceId: appInstance.instanceId,
    });
  }
}
