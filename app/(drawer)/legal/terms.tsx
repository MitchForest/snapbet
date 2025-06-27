import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

export default function TermsOfServiceScreen() {
  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Terms of Service" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View padding="$4">
          <Text fontSize={12} color="$textSecondary" marginBottom="$4">
            Last Updated: January 1, 2024
          </Text>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              1. Acceptance of Terms
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              By accessing and using SnapBet ("the App"), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use the App.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              2. Age Requirement
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20} marginBottom="$2">
              You must be at least 21 years of age to use SnapBet. By using the App, you represent
              and warrant that you are 21 years of age or older.
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              SnapBet is intended for entertainment purposes only. Users are responsible for
              complying with all local, state, and federal laws regarding sports betting in their
              jurisdiction.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              3. Account Registration
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • You must provide accurate and complete information when creating an account{'\n'}
              • You are responsible for maintaining the confidentiality of your account{'\n'}
              • You are responsible for all activities that occur under your account{'\n'}
              • You must notify us immediately of any unauthorized use of your account
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              4. Virtual Currency
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20} marginBottom="$2">
              SnapBet uses virtual currency for entertainment purposes only. This virtual currency:
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • Has no real-world monetary value{'\n'}
              • Cannot be exchanged for real money{'\n'}
              • Cannot be transferred between users{'\n'}
              • Is reset weekly to maintain fair play
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              5. User Conduct
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              You agree not to:{'\n'}
              • Use the App for any illegal purposes{'\n'}
              • Harass, abuse, or harm other users{'\n'}
              • Post inappropriate, offensive, or misleading content{'\n'}
              • Attempt to manipulate or exploit the App{'\n'}
              • Create multiple accounts{'\n'}
              • Share your account with others
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              6. Content Guidelines
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • You retain ownership of content you post{'\n'}
              • You grant SnapBet a license to use your content{'\n'}
              • You are responsible for your content{'\n'}
              • We may remove content that violates our guidelines{'\n'}
              • Content must not infringe on others' rights
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              7. Privacy
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              Your use of SnapBet is also governed by our Privacy Policy. Please review our Privacy
              Policy to understand our practices.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              8. Disclaimers
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              • SnapBet is for entertainment purposes only{'\n'}
              • We do not facilitate real money gambling{'\n'}
              • We do not guarantee the accuracy of sports data{'\n'}
              • The App is provided "as is" without warranties{'\n'}
              • We are not responsible for user-generated content
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              9. Limitation of Liability
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              To the maximum extent permitted by law, SnapBet shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting from your use of the
              App.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              10. Account Termination
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              We reserve the right to suspend or terminate your account at any time for violation of
              these terms or for any other reason at our sole discretion.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              11. Changes to Terms
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              We may update these Terms of Service from time to time. We will notify you of any
              changes by posting the new Terms on this page and updating the "Last Updated" date.
            </Text>
          </View>

          <View marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
              12. Contact Information
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={20}>
              If you have any questions about these Terms of Service, please contact us at:{'\n\n'}
              Email: legal@snapbet.com{'\n'}
              Phone: 1-800-SNAPBET (1-800-762-7238)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 