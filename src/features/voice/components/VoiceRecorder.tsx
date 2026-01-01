/**
 * Voice Recorder Component
 * Animated voice recording UI with waveform visualization
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { voiceRecordingService } from '../services/voiceRecordingService';
import { Colors } from '@/lib/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/lib/constants/typography';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, durationSeconds: number) => void;
  maxDurationSeconds?: number;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  maxDurationSeconds = 30,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [durationMillis, setDurationMillis] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0.3))
  ).current;

  // Timer for updating recording status
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
      voiceRecordingService.cleanup();
    };
  }, []);

  // Start waveform animation
  const startWaveformAnimation = () => {
    waveformAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400 + index * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400 + index * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  // Stop waveform animation
  const stopWaveformAnimation = () => {
    waveformAnims.forEach((anim) => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });
  };

  // Pulse animation for recording button
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // Update recording status
  const updateRecordingStatus = async () => {
    const status = await voiceRecordingService.getRecordingStatus();
    if (status) {
      setDurationMillis(status.durationMillis);
    }
  };

  // Update playback status
  const updatePlaybackStatus = async () => {
    const status = await voiceRecordingService.getPlaybackStatus();
    if (status) {
      setPlaybackPosition(status.positionMillis);
      if (!status.isPlaying && status.positionMillis >= status.durationMillis) {
        setRecordingState('recorded');
        if (statusTimerRef.current) {
          clearInterval(statusTimerRef.current);
        }
      }
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      await voiceRecordingService.startRecording(maxDurationSeconds * 1000);
      setRecordingState('recording');
      setDurationMillis(0);
      startWaveformAnimation();
      startPulseAnimation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Update status every 100ms
      statusTimerRef.current = setInterval(updateRecordingStatus, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    try {
      const uri = await voiceRecordingService.stopRecording();
      if (uri) {
        const duration = await voiceRecordingService.getAudioDuration(uri);
        setRecordingUri(uri);
        setRecordingState('recorded');
        setDurationMillis(duration * 1000);
        onRecordingComplete(uri, duration);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      stopWaveformAnimation();
      stopPulseAnimation();

      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Play recording
  const handlePlayRecording = async () => {
    if (!recordingUri) return;

    try {
      await voiceRecordingService.playAudio(recordingUri);
      setRecordingState('playing');
      setPlaybackPosition(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Update playback status every 100ms
      statusTimerRef.current = setInterval(updatePlaybackStatus, 100);
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  };

  // Pause playback
  const handlePausePlayback = async () => {
    try {
      await voiceRecordingService.pauseAudio();
      setRecordingState('recorded');
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  // Delete recording
  const handleDeleteRecording = async () => {
    try {
      await voiceRecordingService.stopAudio();
      setRecordingUri(null);
      setRecordingState('idle');
      setDurationMillis(0);
      setPlaybackPosition(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  // Format time in MM:SS
  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Recording State: Idle */}
      {recordingState === 'idle' && (
        <View style={styles.idleState}>
          <Text style={styles.instructionText}>
            Tap to record a short greeting
          </Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleStartRecording}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={48} color="white" />
          </TouchableOpacity>
          <Text style={styles.hintText}>
            Max {maxDurationSeconds} seconds
          </Text>
        </View>
      )}

      {/* Recording State: Recording */}
      {recordingState === 'recording' && (
        <View style={styles.recordingState}>
          <View style={styles.waveformContainer}>
            {waveformAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.timerText}>{formatTime(durationMillis)}</Text>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.recordButton, styles.recordingButton]}
              onPress={handleStopRecording}
              activeOpacity={0.8}
            >
              <View style={styles.stopIcon} />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}

      {/* Recording State: Recorded */}
      {(recordingState === 'recorded' || recordingState === 'playing') && (
        <View style={styles.recordedState}>
          <View style={styles.playbackInfo}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.interactive.primary}
            />
            <Text style={styles.successText}>Greeting recorded!</Text>
          </View>

          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleDeleteRecording}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.light.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={
                recordingState === 'playing'
                  ? handlePausePlayback
                  : handlePlayRecording
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name={recordingState === 'playing' ? 'pause' : 'play'}
                size={32}
                color="white"
              />
            </TouchableOpacity>

            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>
                {recordingState === 'playing'
                  ? formatTime(playbackPosition)
                  : formatTime(durationMillis)}
              </Text>
            </View>
          </View>

          {recordingState === 'playing' && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(playbackPosition / durationMillis) * 100}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  // Idle State
  idleState: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  instructionText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    color: Colors.light.text.primary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.interactive.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hintText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.tertiary,
    textAlign: 'center',
  },
  // Recording State
  recordingState: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 60,
  },
  waveformBar: {
    width: 6,
    height: 60,
    backgroundColor: Colors.interactive.primary,
    borderRadius: 3,
  },
  timerText: {
    fontFamily: Typography.fonts.mono,
    fontSize: Typography.sizes['3xl'],
    color: Colors.light.text.primary,
    fontWeight: Typography.weights.bold,
  },
  recordingButton: {
    backgroundColor: Colors.light.error,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  recordingText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    color: Colors.light.error,
    fontWeight: Typography.weights.medium,
  },
  // Recorded State
  recordedState: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  playbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successText: {
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.lg,
    color: Colors.interactive.primary,
    fontWeight: Typography.weights.semibold,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.interactive.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  durationContainer: {
    width: 48,
    alignItems: 'center',
  },
  durationText: {
    fontFamily: Typography.fonts.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.light.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.interactive.primary,
  },
});
