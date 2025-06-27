import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

export default function PrivacyPolicyScreen() {
  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Privacy Policy" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View padding="$4">
          <Text fontSize={12} color="$textSecondary" marginBottom="$4">
            Last Updated: January 1, 2024
          </Text>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              1. Information We Collect
            </Text>
            <Text fontSize={16} fontWeight="500" color="$textPrimary" marginBottom="$1">
              Information You Provide:
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20} marginBottom="$2">
              • Account information (username, email, display name){'\n'}• Profile information (bio,
              avatar, favorite team){'\n'}• Content you create (posts, comments, picks){'\n'}•
              Communications with other users
            </Text>
            <Text fontSize={16} fontWeight="500" color="$textPrimary" marginBottom="$1">
              Information We Collect Automatically:
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • Device information (type, OS version){'\n'}• Usage data (features used, time spent)
              {'\n'}• Performance data (crashes, errors){'\n'}• IP address and general location
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              2. How We Use Your Information
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              We use your information to:{'\n'}• Provide and maintain the App{'\n'}• Personalize
              your experience{'\n'}• Enable social features{'\n'}• Send notifications (with your
              permission){'\n'}• Improve our services{'\n'}• Ensure safety and security{'\n'}•
              Comply with legal obligations
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              3. Information Sharing
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20} marginBottom="$2">
              We do not sell your personal information. We may share your information:
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • With other users (based on your privacy settings){'\n'}• With service providers who
              help us operate the App{'\n'}• To comply with legal requirements{'\n'}• To protect
              rights and safety{'\n'}• With your consent
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              4. Data Storage and Security
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • We use industry-standard security measures{'\n'}• Data is encrypted in transit and
              at rest{'\n'}• We regularly review our security practices{'\n'}• No method is 100%
              secure, but we strive to protect your data
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              5. Your Privacy Controls
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              You can control your privacy through:{'\n'}• Privacy settings (private account, stats
              visibility){'\n'}• Notification preferences{'\n'}• Blocking and reporting features
              {'\n'}• Account deletion
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              6. Children&apos;s Privacy
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              SnapBet is not intended for users under 21 years of age. We do not knowingly collect
              information from anyone under 21. If we learn we have collected information from
              someone under 21, we will delete it.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              7. Data Retention
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • We retain your information while your account is active{'\n'}• Some information may
              be retained after account deletion{'\n'}• We delete or anonymize data when no longer
              needed{'\n'}• Legal requirements may require longer retention
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              8. Your Rights
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              Depending on your location, you may have rights to:{'\n'}• Access your personal
              information{'\n'}• Correct inaccurate information{'\n'}• Delete your information{'\n'}
              • Export your data{'\n'}• Opt-out of certain uses
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              9. Third-Party Services
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              We use third-party services for:{'\n'}• Analytics (to understand usage){'\n'}• Cloud
              storage (Supabase){'\n'}• Push notifications{'\n\n'}
              These services have their own privacy policies.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              10. International Users
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              If you use SnapBet outside the United States, your information may be transferred to
              and processed in the United States.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              11. Changes to This Policy
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the new Privacy Policy on this page and updating the &quot;Last
              Updated&quot; date.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              12. Contact Us
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              If you have questions about this Privacy Policy or our privacy practices, please
              contact us at:{'\n\n'}
              Email: privacy@snapbet.com{'\n'}
              Phone: 1-800-SNAPBET (1-800-762-7238){'\n'}
              Mail: SnapBet Privacy Team{'\n'}
              {'      '}123 Main Street{'\n'}
              {'      '}New York, NY 10001
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
